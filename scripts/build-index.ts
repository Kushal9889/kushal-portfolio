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

  const vectors: number[][] = [];
  // Batched to stay inside the endpoint's per-request input limit.
  for (let i = 0; i < texts.length; i += 8) {
    const batch = texts.slice(i, i + 8);
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
      console.warn(`build-index: embedding request failed (${res.status}), falling back to BM25.`);
      return null;
    }
    const json = await res.json();
    vectors.push(...json.data.map((d: { embedding: number[] }) => d.embedding));
  }
  return vectors;
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
