import { embedQuery } from "./model";
import index from "./index.json";

export type Chunk = { title: string; body: string; source: string };

type IndexShape = {
  chunks: Chunk[];
  /** Per-chunk term frequencies, plus the length needed for BM25 normalisation. */
  tf: Record<string, number>[];
  lengths: number[];
  df: Record<string, number>;
  avgLength: number;
  /** Present only when an embedding provider was configured at build time. */
  vectors: number[][] | null;
};

// Cast through unknown: TypeScript infers a literal type for every term in the
// generated index, which does not structurally match the declared shape.
const idx = index as unknown as IndexShape;

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

const K1 = 1.5;
const B = 0.75;

/**
 * BM25 over the corpus.
 *
 * Dense retrieval alone is wrong for this content. Embeddings compress meaning
 * and lose surface form, so they miss exact strings, and exact strings are what
 * people actually type here: "Cosmos DB", "NCP-AAI", "Growaza", "LangGraph".
 * Keyword scoring handles those; the vector half handles intent.
 */
function bm25(query: string): number[] {
  const terms = tokenize(query);
  const N = idx.chunks.length;

  return idx.tf.map((tf, i) => {
    let score = 0;
    for (const term of terms) {
      const f = tf[term];
      if (!f) continue;
      const df = idx.df[term] ?? 0;
      const inverseDocFreq = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      const norm = 1 - B + (B * idx.lengths[i]) / idx.avgLength;
      score += inverseDocFreq * ((f * (K1 + 1)) / (f + K1 * norm));
    }
    return score;
  });
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

function rankOf(scores: number[]): Map<number, number> {
  const order = scores
    .map((score, i) => ({ score, i }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return new Map(order.map((s, rank) => [s.i, rank + 1]));
}

/**
 * Reciprocal rank fusion.
 *
 * Merging on rank rather than raw score means the two retrievers do not need
 * comparable scales, which they do not have: BM25 is unbounded and cosine is
 * bounded to [-1, 1]. Normalising them against each other would need tuning that
 * a corpus this size cannot justify.
 */
const RRF_K = 60;

/**
 * How far ahead the top lexical hit must be before the dense half is skipped.
 * Tuned by hand against the eval set: a query like "Growaza" or "NCP-AAI" lands
 * one chunk far clear of the rest, and no embedding is going to reorder that.
 */
const LEXICAL_CONFIDENCE = 2.2;

/**
 * One chunk's position in both retrievers and in the fusion.
 *
 * Exposed so the page can draw the actual fusion rather than an impression of
 * it. Every field is a number this function computed on the way to an answer;
 * nothing is derived for display.
 */
export type FusionRow = {
  title: string;
  /** Raw BM25, unbounded. */
  lexicalScore: number;
  /** 1-based rank in the lexical retriever, null when it scored zero. */
  lexicalRank: number | null;
  /** 1-based rank in the dense retriever, null when dense was skipped or scored zero. */
  denseRank: number | null;
  /** The reciprocal rank fusion total that decides the ordering. */
  fused: number;
  selected: boolean;
};

export type RetrievalTrace = {
  k: number;
  /** True when the lexical hit was clear enough that the embedding call was skipped. */
  lexicalDecisive: boolean;
  denseUsed: boolean;
  rows: FusionRow[];
};

export async function retrieve(query: string, topK = 4) {
  const lexicalScores = bm25(query);
  const lexical = rankOf(lexicalScores);

  const sorted = [...lexicalScores].sort((a, b) => b - a);
  const decisive = sorted[0] > 0 && sorted[0] > (sorted[1] || 0) * LEXICAL_CONFIDENCE;

  let dense = new Map<number, number>();
  // The embedding call is a network round trip and the largest single cost in
  // retrieval. When a rare term has already picked out one chunk unambiguously,
  // paying for it buys nothing, so the question is answered without it.
  if (idx.vectors && !decisive) {
    const q = await embedQuery(query);
    if (q) dense = rankOf(idx.vectors.map((v) => cosine(q, v)));
  }

  const fused = idx.chunks.map((chunk, i) => {
    const l = lexical.get(i);
    const d = dense.get(i);
    const score = (l ? 1 / (RRF_K + l) : 0) + (d ? 1 / (RRF_K + d) : 0);
    return { chunk, score };
  });

  const winners = fused
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const chosen = new Set(winners.map((w) => w.chunk.title));

  const trace: RetrievalTrace = {
    k: RRF_K,
    lexicalDecisive: decisive,
    denseUsed: dense.size > 0,
    rows: idx.chunks.map((chunk, i) => ({
      title: chunk.title,
      lexicalScore: +lexicalScores[i].toFixed(4),
      lexicalRank: lexical.get(i) ?? null,
      denseRank: dense.get(i) ?? null,
      fused: +fused[i].score.toFixed(6),
      selected: chosen.has(chunk.title),
    })),
  };

  return { chunks: winners.map((r) => r.chunk), trace };
}

/** Whether the dense half is actually available, for the trace panel to report honestly. */
export const hasDense = idx.vectors !== null;
export const chunkCount = idx.chunks.length;
