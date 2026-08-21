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

/**
 * Words that carry no signal in a corpus that is entirely about one person.
 *
 * BM25 down-weights common terms through IDF, and on a seventeen-chunk corpus
 * that is not nearly enough: "he" appears in ten of them and still scores 0.54,
 * "what" in seven and scores 0.88. Combined with length normalisation, which
 * rewards short documents, a 64-token section could outrank the 180-token
 * section that actually answers the question purely on the strength of matching
 * the question's grammar.
 *
 * It showed on "What did he build at IMG Systems?", where "What he does not do"
 * took the top rank -- three "what"s, five "he"s and one passing "IMG" beat two
 * "IMG"s and three "Systems". The answer was still right, because the model
 * sees all four retrieved chunks, but the top chunk is what the sources line
 * shows first and what the degraded path serves when no provider is reachable.
 *
 * Pronouns are in the list for a reason specific to this corpus rather than to
 * English: every chunk is about the same person, so "he" and "his" are closer
 * to punctuation than to content.
 */
const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one",
  "our", "out", "day", "get", "has", "him", "his", "how", "its", "new", "now", "old", "see",
  "two", "way", "who", "did", "yes", "let", "put", "say", "she", "too", "use", "that", "with",
  "this", "have", "from", "they", "been", "were", "what", "when", "there", "their", "would",
  "about", "which", "them", "than", "then", "into", "only", "some", "just", "over", "also",
  "does", "doing", "done", "any", "his", "he", "at", "in", "on", "of", "to", "is", "it", "as",
  "an", "by", "or", "be", "do", "we", "if", "so", "up", "me", "my", "us", "tell",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
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
type FusionRow = {
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

/**
 * The part of a question that is actually about the corpus.
 *
 * Select-to-ask wraps a highlighted phrase as `What does this mean: "..."`, and
 * every word of that wrapper goes into BM25 as a term. Measured: asking about
 * the dense retriever returned `Achievements` as a source, because the wrapper
 * words are common across the corpus and diluted the phrase that carried the
 * meaning. When a question wraps a quoted span of real length, that span is the
 * query; the wrapper is grammar, not signal.
 */
function core(query: string): string {
  const quoted = query.match(/["\u201c]([^"\u201d]{12,})["\u201d]/);
  return quoted ? quoted[1] : query;
}

/**
 * How far below the top result a chunk may score and still be sent to the model.
 *
 * `topK` used to be a promise as well as a ceiling: four chunks came back
 * whether or not four were relevant, so a narrow question was answered with two
 * good sections and two chosen by whatever scored above zero. Padding the
 * context with unrelated text is how a grounded answer drifts, and it is what
 * put an unrelated section under a question about retrieval.
 */
const RELEVANCE_FLOOR = 0.55;

/**
 * The same idea, applied to the keyword score when the dense half was skipped.
 *
 * Reciprocal rank fusion is deliberately flat: with one retriever running, rank
 * one scores 1/61 and rank four scores 1/64, which is a spread of five percent.
 * A floor expressed on the fused score therefore cannot cut anything on the
 * short-circuit path, and that is exactly the path where cutting matters most,
 * because nothing has cross-checked the keyword ranking.
 *
 * It showed: "why reciprocal rank fusion instead of a weighted blend" retrieved
 * the achievements section second, on the strength of the word "rank" appearing
 * in "CodeChef global rank 64". BM25 was working; the term is genuinely there.
 * Nothing downstream knew the match was an accident of vocabulary.
 *
 * The short-circuit already asserts one chunk is 2.2x clear of the next, so a
 * half-of-leader floor keeps whatever shares the leader's footing and drops
 * what the short-circuit had already declared irrelevant.
 */
const LEXICAL_FLOOR = 0.5;

export async function retrieve(query: string, topK = 4) {
  query = core(query);
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
    // Best single rank, kept for the tiebreak below.
    const best = Math.min(l ?? Infinity, d ?? Infinity);
    return { chunk, score, best, lexicalScore: lexicalScores[i] };
  });

  /**
   * Reciprocal rank fusion produces exact ties, and the tiebreak was corpus order.
   *
   * RRF is symmetric: a chunk ranked 1 by keyword and 2 by embedding scores
   * exactly what a chunk ranked 2 and 1 scores. That is the formula working
   * correctly, and it left `sort` to break the tie, which for a stable sort
   * means whichever section appears earlier in facts.md wins -- a ranking
   * signal that is really just file layout.
   *
   * It showed: "What did he build at IMG Systems?" tied "IMG Systems" against
   * "What he does not do" at 0.032522, and the scope-limits section won because
   * it is written three headings higher. The answer was still correct, because
   * the model saw all four chunks, but the top chunk is what the page shows
   * first and what the degraded path serves when no provider is reachable --
   * so a visitor asking about IMG Systems could be handed "He has no PyTorch or
   * TensorFlow training experience".
   *
   * Ties break on the better single rank -- being any retriever's first choice
   * beats being two retrievers' second -- and then on keyword score, which is
   * the sharper signal on a corpus this small.
   */
  const winners = fused
    .filter((r) => r.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.best - b.best || b.lexicalScore - a.lexicalScore,
    )
    .slice(0, topK);

  // topK is a ceiling, not a quota. A chunk scoring far under the leader is
  // not evidence, it is filler, and filler in the context window is how a
  // grounded answer drifts off the question that was asked. The first result
  // always survives: a weak best match is still the best match, and answering
  // from it is better than answering from nothing.
  const lead = winners[0]?.score ?? 0;
  const lexLead = winners[0]?.lexicalScore ?? 0;
  const kept = winners.filter((r, i) => {
    if (i === 0) return true;
    if (r.score < lead * RELEVANCE_FLOOR) return false;
    // With the embedding call skipped, the keyword score is the only evidence
    // there is, so it is what the floor has to read.
    if (!dense.size && lexLead > 0 && r.lexicalScore < lexLead * LEXICAL_FLOOR) return false;
    return true;
  });

  const chosen = new Set(kept.map((w) => w.chunk.title));

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

  return { chunks: kept.map((r) => r.chunk), trace };
}

/** Whether the dense half is actually available, for the trace panel to report honestly. */
export const hasDense = idx.vectors !== null;
