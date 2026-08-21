import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadContent } from "../lib/content";

/**
 * Builds the retrieval index at compile time.
 *
 * Everything expensive happens here so the request path does none of it: no
 * indexing, no database, no network handshake to a vector store. The corpus is
 * small enough that the whole index is a JSON file bundled with the function,
 * which makes retrieval a memory read instead of a round trip. At this size a
 * vector database would add latency and operational surface without buying
 * anything back.
 */

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * The embedding model accepts 512 tokens and nothing was enforcing it.
 *
 * A section that grew past the limit returned 400, the whole request failed, and
 * `embedPassages` returned null for every chunk in the corpus -- so one long
 * paragraph silently downgraded the entire site to keyword-only retrieval and
 * took the projection figure with it. The only signal was one warning line in a
 * build log nobody reads. This is exactly the class of failure the page is about,
 * and it shipped here.
 *
 * The fix is not to cut prose to fit an API limit. Long passages are split into
 * windows on paragraph boundaries, each window is embedded, and the results are
 * mean-pooled into one vector for the chunk. That is the standard treatment for
 * a passage longer than a model's context, it keeps one vector per chunk so
 * retrieval and the projection are unchanged, and the corpus stays whatever
 * length it needs to be.
 *
 * 1400 characters is deliberately conservative against the 512-token limit:
 * this corpus measures about 1.4 tokens per word, and a hard failure here costs
 * the whole index.
 */
const WINDOW_CHARS = 1400;

function windows(text: string): string[] {
  if (text.length <= WINDOW_CHARS) return [text];

  const out: string[] = [];
  let current = "";
  // Paragraphs first, then sentences for a single paragraph that is itself over
  // the limit. Splitting mid-sentence would embed a fragment whose meaning is
  // not the meaning of the passage it came from.
  for (const para of text.split(/\n{2,}/)) {
    for (const piece of para.length > WINDOW_CHARS ? para.split(/(?<=\.)\s+/) : [para]) {
      if (current && current.length + piece.length > WINDOW_CHARS) {
        out.push(current.trim());
        current = "";
      }
      current += (current ? " " : "") + piece;
    }
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

/** Mean of the window vectors, renormalised so cosine stays well behaved. */
function pool(vectors: number[][]): number[] {
  if (vectors.length === 1) return vectors[0];
  const mean = vectors[0].map(
    (_, d) => vectors.reduce((sum, v) => sum + v[d], 0) / vectors.length,
  );
  const norm = Math.hypot(...mean) || 1;
  return mean.map((v) => v / norm);
}

/** Query-time embeddings come from the same model, so both sides must match. */
async function embedPassages(texts: string[]): Promise<number[][] | null> {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    console.warn(
      "build-index: NVIDIA_API_KEY not set, building lexical-only index.\n" +
        "  Retrieval will run BM25 alone. Set the key and rebuild to enable hybrid search.",
    );
    return null;
  }

  // Every chunk becomes one or more windows, each tagged with the chunk it came
  // from, so the flat list can be batched and then pooled back.
  const pieces = texts.flatMap((text, chunk) => windows(text).map((body) => ({ chunk, body })));
  const oversized = pieces.length - texts.length;
  if (oversized > 0) {
    console.log(`build-index: ${oversized} extra window(s) for passages over ${WINDOW_CHARS} chars`);
  }

  const perChunk: number[][][] = texts.map(() => []);
  // Batched to stay inside the endpoint's per-request input limit.
  for (let i = 0; i < pieces.length; i += 8) {
    const slice = pieces.slice(i, i + 8);
    const batch = slice.map((p) => p.body);
    const res = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        input: batch,
        model: "nvidia/nv-embedqa-e5-v5",
        input_type: "passage",
      }),
    });
    if (!res.ok) {
      // Loud, and it names the chunk. A key that is absent is a supported state;
      // a key that is present and rejected is a corpus or model problem, and
      // reporting it as "falling back to BM25" is how this went unnoticed.
      const detail = await res.text().catch(() => "");
      console.error(
        `build-index: embedding request failed (${res.status}) on chunk ` +
          `"${texts[slice[0].chunk].slice(0, 60)}..." ${detail.slice(0, 200)}`,
      );
      return null;
    }
    const json = await res.json();
    json.data.forEach((d: { embedding: number[] }, n: number) => {
      perChunk[slice[n].chunk].push(d.embedding);
    });
  }

  return perChunk.map(pool);
}

async function main() {
  const { sections } = loadContent();

  // The heading is part of the searchable text. Titles carry the strongest terms
  // in this corpus ("Growaza", "BU Life AI"), and losing them to the chunk
  // boundary would make the most precise queries the least well served.
  const chunks = sections.map((s) => ({
    title: s.title,
    // Role and stack are rendered structurally rather than as prose, so they are
    // folded back in here. They carry the rarest terms in the corpus, which is
    // precisely what the keyword half of retrieval scores on.
    body: [s.role && `Role: ${s.role}`, s.stack.length && `Stack: ${s.stack.join(", ")}`, s.body]
      .filter(Boolean)
      .join("\n"),
    source: s.source,
  }));

  const docs = chunks.map((c) => tokenize(`${c.title} ${c.title} ${c.body}`));

  const tf = docs.map((tokens) => {
    const counts: Record<string, number> = {};
    for (const t of tokens) counts[t] = (counts[t] ?? 0) + 1;
    return counts;
  });

  const df: Record<string, number> = {};
  for (const counts of tf) {
    for (const term of Object.keys(counts)) df[term] = (df[term] ?? 0) + 1;
  }

  const lengths = docs.map((d) => d.length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

  const vectors = await embedPassages(chunks.map((c) => `${c.title}\n${c.body}`));

  const out = { chunks, tf, lengths, df, avgLength, vectors };
  const path = join(process.cwd(), "lib", "agent", "index.json");
  writeFileSync(path, JSON.stringify(out));

  const size = (JSON.stringify(out).length / 1024).toFixed(0);
  console.log(
    `build-index: ${chunks.length} chunks, ${Object.keys(df).length} terms, ` +
      `${vectors ? `${vectors[0].length}-dim vectors` : "lexical only"}, ${size}KB`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
