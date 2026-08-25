import { embedQuery, rerank } from "./model";
import type { ChunkMeta } from "./query";
import { correct } from "./vocab";
import index from "./index.json";

export type Chunk = { title: string; body: string; source: string; meta?: ChunkMeta };

type Passage = { parent: string; ordinal: number; text: string; tokens: number };

type IndexShape = {
  /** The ranked unit: a semantic passage of roughly 100-150 tokens. */
  passages: Passage[];
  /** The unit handed to the model: the whole section a passage came from. */
  parents: Chunk[];
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

import { queryTokens, indexTokens } from "./tokenize";

/**
 * Query-time tokens.
 *
 * Re-exported rather than redefined. This file and `scripts/build-index.ts`
 * each had their own copy differing only in a stopword filter, and nothing kept
 * them in step -- which is how 169 of 1,342 indexed terms came to end in a full
 * stop while queries were tokenised without one.
 */
export const tokenize = queryTokens;
export { indexTokens };

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
  const N = idx.passages.length;

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

/**
 * How similarity between two vectors is measured.
 *
 * Exposed so `scripts/bench-retrieval.ts` can compare them on this corpus
 * rather than repeating what a blog post says. One result is worth stating
 * because it is provable rather than empirical: these embeddings are unit
 * length, and for unit vectors squared euclidean distance is 2 - 2cos, which is
 * monotonic in cosine -- so cosine and L2 produce identical rankings, always,
 * and any measured difference between them is a bug in the harness. L1 has no
 * such relationship and genuinely differs.
 */
export type Metric = "cosine" | "dot" | "l2" | "l1";

export function similarity(a: number[], b: number[], metric: Metric = "cosine"): number {
  if (metric === "dot") {
    let dot = 0;
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
    return dot;
  }
  if (metric === "l2") {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
    // Negated: every caller ranks descending, and a distance is better small.
    return -Math.sqrt(sum);
  }
  if (metric === "l1") {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
    return -sum;
  }
  return cosine(a, b);
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

/**
 * Positions, best first.
 *
 * `keepAll` exists because the distance metrics are negated to make "larger is
 * better" true everywhere, so every L2 and L1 score is below zero and a filter
 * on `score > 0` would silently rank nothing at all. That filter is correct for
 * BM25, where zero means the term never appeared.
 */
function rankOf(scores: number[], keepAll = false): Map<number, number> {
  const order = scores
    .map((score, i) => ({ score, i }))
    .filter((s) => keepAll || s.score > 0)
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

/*
 * The lexical short-circuit, measured and removed.
 *
 * It skipped the embedding call when the top keyword hit was 2.2x clear of the
 * next, on the reasoning that a rare term like "Growaza" or "NCP-AAI" lands one
 * chunk far ahead of the rest and no embedding is going to reorder it. The
 * comment named those two queries as the case it was tuned for.
 *
 * Neither of them passes it. Measured across the eval set:
 *
 *   Growaza                             top 2.813   2nd 2.377   not decisive
 *   NCP-AAI                             top 2.256   2nd 1.126   not decisive
 *   What did he do at IMG Systems?      top 5.123   2nd 4.873   not decisive
 *   What bug did he find in LangChain?  top 4.650   2nd 3.412   not decisive
 *   What did he ship?                   top 1.270   2nd 0.000   DECISIVE
 *
 * The one query it fired on is the weakest scoring query in the set, and it
 * fired because the test compares against `sorted[1] || 0` -- so when nothing
 * else scores at all, any single hit beats zero times anything and counts as
 * confidence. A lone weak match is not confidence; it is the absence of
 * competition, and it is exactly when the dense half is most needed.
 *
 * The consequence reached a reader. "What did he ship?" survives stopword
 * removal as ["ship"], the only chunk containing that token is the section
 * describing this website -- because it says the page refuses to "ship claims
 * it cannot support" -- and with the embedding call skipped there was nothing
 * left to notice that a career question had been answered with a paragraph
 * about Netlify.
 *
 * So it is gone rather than retuned. It never once fired on a query it was
 * written for, it fired on 5 of 40 retrievals in the eval suite and all of them
 * were of this kind, and both retrievers now run on every question. The cost is
 * one embedding call, measured at 236-421ms, on questions that were being
 * answered wrongly without it.
 */

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
  denseUsed: boolean;
  /** How many passages were ranked to produce these sections. */
  passages?: number;
  /** Tokens repaired against the index vocabulary, as [typed, read as]. */
  corrections?: [string, string][];
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
/**
 * How many passages are ranked before they are folded back into sections.
 *
 * Ten rather than four. The unit being ranked is now a 123-token passage rather
 * than a whole section, so ten passages typically resolve to three or four
 * distinct sections -- the same amount of context the model used to get, chosen
 * with far more precision, and with a second chance for a section whose best
 * passage was not its first.
 */
const PASSAGE_K = 10;

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

/**
 * The tuning, in one exported place.
 *
 * Every one of these was a decision with a reason, and all of them lived as
 * bare module constants that nothing outside this file could read -- so the
 * page could describe the retrieval design in prose but never state the numbers
 * it actually runs on. Exported so the corpus panel reports them rather than
 * repeating them.
 */
export const RETRIEVAL_PARAMS = {
  k1: K1,
  b: B,
  rrfK: RRF_K,
  relevanceFloor: RELEVANCE_FLOOR,
  lexicalFloor: LEXICAL_FLOOR,
  topK: 4,
  passageK: PASSAGE_K,
} as const;


/**
 * Exactly the text the retrievers score, after the wrapper is stripped and
 * typos are repaired.
 *
 * Exported because anything that needs the query vector must ask for it under
 * the same key `retrieve` will use, or it pays for a second embedding of a
 * near-identical string. `/api/vector` did exactly that: it embedded the raw
 * query, `retrieve` embedded the corrected one, the process cache missed, and
 * one question cost two network round trips -- which then showed up inside the
 * timing as a 321ms "scan" that is really 0.8ms of scanning.
 */
export function searchText(query: string): string {
  return correct(core(query)).text;
}

export async function retrieve(
  query: string,
  topK = 4,
  weight: (meta: ChunkMeta | undefined) => number = () => 1,
  floor = RELEVANCE_FLOOR,
  metric: Metric = "cosine",
) {
  query = core(query);
  // Typos are repaired against the index vocabulary before scoring. BM25
  // matches exactly, so one wrong character removes a term entirely -- and on a
  // question naming a section, it also changes how the question is classified.
  const { text: corrected, fixes } = correct(query);
  const lexicalScores = bm25(corrected);
  const lexical = rankOf(lexicalScores);

  let dense = new Map<number, number>();
  if (idx.vectors) {
    const q = await embedQuery(corrected);
    if (q) dense = rankOf(idx.vectors.map((v) => similarity(q, v, metric)), true);
  }

  const parentOf = new Map(idx.parents.map((p) => [p.title, p]));

  const fused = idx.passages.map((passage, i) => {
    const l = lexical.get(i);
    const d = dense.get(i);
    /*
     * Rank fusion, then a weight for what kind of section can answer this kind
     * of question.
     *
     * Applied after fusion rather than inside it, so the weight breaks ties and
     * demotes structurally wrong sections without being able to invent a match
     * neither retriever found: a passage that scored zero in both still scores
     * zero here, whatever its parent's metadata says.
     */
    const score =
      ((l ? 1 / (RRF_K + l) : 0) + (d ? 1 / (RRF_K + d) : 0)) *
      weight(parentOf.get(passage.parent)?.meta);
    return {
      passage,
      score,
      best: Math.min(l ?? Infinity, d ?? Infinity),
      lexicalScore: lexicalScores[i],
    };
  });

  /**
   * Reciprocal rank fusion produces exact ties, and the tiebreak was corpus order.
   *
   * RRF is symmetric: a passage ranked 1 by keyword and 2 by embedding scores
   * exactly what a passage ranked 2 and 1 scores. That is the formula working
   * correctly, and it left `sort` to break the tie, which for a stable sort
   * means whichever passage appears earlier in the file wins -- a ranking
   * signal that is really just file layout.
   *
   * Ties break on the better single rank -- being any retriever's first choice
   * beats being two retrievers' second -- and then on keyword score, which is
   * the sharper signal on a corpus this small.
   */
  const ranked = fused
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.best - b.best || b.lexicalScore - a.lexicalScore)
    .slice(0, PASSAGE_K);

  /*
   * Optional cross-encoder pass over the shortlist.
   *
   * Off unless RERANK=1. Retrieval already scores precision@1 1.00 on the eval
   * set and a second stage cannot improve on that, so this costs 587ms to
   * reorder a list that is already correct. It exists, it is benchmarked by
   * scripts/bench-retrieval.ts, and it is off -- which is a decision with a
   * number behind it rather than a stage nobody built.
   */
  let shortlist = ranked;
  if (process.env.RERANK === "1" && ranked.length > 1) {
    const scores = await rerank(
      corrected,
      ranked.map((r) => `${r.passage.parent}\n${r.passage.text}`),
    );
    if (scores) {
      const order = new Map(scores.map((s, position) => [s.index, position]));
      shortlist = [...ranked].sort(
        (a, b) => (order.get(ranked.indexOf(a)) ?? 99) - (order.get(ranked.indexOf(b)) ?? 99),
      );
      // Rank position becomes the score so the fold below still works on one
      // comparable number, whichever stage produced the order.
      shortlist = shortlist.map((r, i) => ({ ...r, score: 1 / (RRF_K + i + 1) }));
    }
  }

  /*
   * Passages fold back into the sections they came from.
   *
   * The retriever ranks a 123-token passage because that is precise. The model
   * is handed the whole section because that is complete: a passage names a
   * figure, and the sentence that says what the figure measures is frequently
   * in the passage next door. Ranking small and reading large is the point of
   * splitting at all.
   *
   * A section's score is its best passage's score. Summing would reward long
   * sections for being long, which is the exact bias BM25's length
   * normalisation exists to remove.
   */
  const bySection = new Map<string, { score: number; lexicalScore: number; hits: number }>();
  for (const r of shortlist) {
    const prev = bySection.get(r.passage.parent);
    bySection.set(r.passage.parent, {
      score: Math.max(prev?.score ?? 0, r.score),
      lexicalScore: Math.max(prev?.lexicalScore ?? 0, r.lexicalScore),
      hits: (prev?.hits ?? 0) + 1,
    });
  }

  const sections = [...bySection.entries()]
    .map(([title, v]) => ({ title, ...v }))
    .sort((a, b) => b.score - a.score || b.hits - a.hits)
    .slice(0, topK);

  // topK is a ceiling, not a quota. A section scoring far under the leader is
  // not evidence, it is filler, and filler in the context window is how a
  // grounded answer drifts off the question that was asked. The first result
  // always survives: a weak best match is still the best match.
  const lead = sections[0]?.score ?? 0;
  const kept = sections.filter((s, i) => i === 0 || s.score >= lead * floor);
  const chosen = new Set(kept.map((s) => s.title));

  const trace: RetrievalTrace = {
    k: RRF_K,
    denseUsed: dense.size > 0,
    // Reported rather than applied silently. A reader who typed a word wrongly
    // should be able to see what it was read as.
    corrections: fixes,
    passages: idx.passages.length,
    // Reported per section rather than per passage. Fifty-three rows is a
    // table; eighteen is a figure a reader can actually follow, and the section
    // is the unit the answer is grounded in.
    rows: idx.parents.map((parent) => {
      const scored = fused.filter((r) => r.passage.parent === parent.title);
      const bestLex = Math.max(0, ...scored.map((r) => r.lexicalScore));
      const lexRanks = scored.map((r) => lexical.get(idx.passages.indexOf(r.passage))).filter(Boolean) as number[];
      const denseRanks = scored.map((r) => dense.get(idx.passages.indexOf(r.passage))).filter(Boolean) as number[];
      return {
        title: parent.title,
        lexicalScore: +bestLex.toFixed(4),
        lexicalRank: lexRanks.length ? Math.min(...lexRanks) : null,
        denseRank: denseRanks.length ? Math.min(...denseRanks) : null,
        fused: +Math.max(0, ...scored.map((r) => r.score)).toFixed(6),
        selected: chosen.has(parent.title),
      };
    }),
  };

  return {
    chunks: kept.map((s) => parentOf.get(s.title)!).filter(Boolean),
    trace,
  };
}
