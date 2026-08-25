/**
 * Semantic chunking, header-aware, with overlap.
 *
 * The corpus was indexed one chunk per `##` section, which is 18 chunks with a
 * fourteen-fold spread in length: 249 characters for Availability against 3,565
 * for the section describing this site. That has two consequences and both were
 * measured.
 *
 * BM25 normalises by length, so a short section is easier to rank highly than a
 * long one on the same evidence, and the long sections are the ones that
 * actually explain things. Worse, four sections exceeded the embedding model's
 * 512-token window, and the build handled that by embedding each window and
 * mean-pooling the results into one vector. Averaging three semantically
 * different windows produces a vector that represents none of them, and the two
 * worst affected were `This site` and `How retrieval on this page works` -- the
 * two sections a technical reader is most likely to ask about.
 *
 * So sections are split into passages of roughly 100-150 tokens, on boundaries
 * where the meaning actually changes rather than at a fixed character count.
 * Each passage keeps its parent section, and retrieval hands the model the
 * parent while ranking on the passage: precision from the small unit, full
 * context from the large one.
 */

/**
 * Tokens per word for this corpus.
 *
 * Measured rather than assumed: the corpus is technical English with a high
 * proportion of identifiers and numbers, which tokenise worse than prose.
 * `scripts/build-index.ts` has used this same figure to size its embedding
 * windows since they were introduced.
 */
const TOKENS_PER_WORD = 1.4;

export const TARGET_TOKENS = 125;
export const MAX_TOKENS = 150;
export const MIN_TOKENS = 100;

export function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.round(words * TOKENS_PER_WORD);
}

/**
 * Sentence spans that keep decimals, identifiers and abbreviations intact.
 *
 * A naive split on `.` cuts `Node.js`, `10.1109/ICAICCIT`, `v2.4` and `30.5
 * percent`, and every one of those appears in this corpus. A sentence only ends
 * when the punctuation is followed by whitespace and a capital or a digit.
 */
export function sentences(text: string): string[] {
  const out: string[] = [];
  let start = 0;
  const re = /[.!?]["')\]]*\s+(?=[A-Z0-9"'(\[])/g;
  for (const m of text.matchAll(re)) {
    const end = m.index + m[0].length;
    const piece = text.slice(start, end).trim();
    if (piece) out.push(piece);
    start = end;
  }
  const tail = text.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}

export type Passage = {
  /** The `##` heading this came from. Never spans two. */
  parent: string;
  /** Position within the parent, so a trace can say which part matched. */
  ordinal: number;
  text: string;
  tokens: number;
};

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
 * Where consecutive sentences stop being about the same thing.
 *
 * Below this similarity to the sentence before it, a sentence starts a new
 * passage even though there is room for more. Read from the corpus, which
 * `scripts/build-index.ts` measures and prints on every build:
 *
 *   p10 0.389   p25 0.470   p50 0.543   p90 0.742
 *
 * The first value tried was 0.62, chosen before the distribution existed and
 * described in this comment as sitting "near the bottom decile". It sits above
 * the median. More than half of all adjacent sentence pairs fell below it, so
 * the semantic test fired almost everywhere and the only thing actually
 * controlling passage size was the MIN_TOKENS guard underneath it -- semantic
 * chunking in name, fixed-size chunking in behaviour.
 *
 * 0.470 is the measured p25: roughly one break in four adjacent pairs, about
 * two per section on this corpus, which is what a topic change looks like in
 * prose that stays on one subject per heading.
 */
export const BREAK_BELOW = 0.47;

/**
 * One sentence of overlap between neighbours.
 *
 * A claim and the number supporting it are frequently one sentence apart, and a
 * boundary between them makes the number unretrievable by the claim's own
 * vocabulary. Overlap is expressed in sentences rather than tokens because
 * half a sentence retrieves nothing useful.
 */
const OVERLAP_SENTENCES = 1;

/**
 * Split one section into passages.
 *
 * `embeddings` are per-sentence and optional. Without them the split is
 * header-aware and size-aware but not semantic, which is the degraded mode the
 * build falls back to when no embedding key is configured -- the same
 * degradation the retriever already has.
 */
export function chunkSection(
  parent: string,
  body: string,
  embeddings?: (number[] | null)[],
): Passage[] {
  const parts = sentences(body);
  if (parts.length === 0) return [];

  const passages: Passage[] = [];
  let current: string[] = [];
  let currentIdx: number[] = [];

  const flush = () => {
    if (!current.length) return;
    const text = current.join(" ");
    passages.push({ parent, ordinal: passages.length, text, tokens: estimateTokens(text) });
    // Carry the tail forward so a claim and its evidence are never separated by
    // a boundary that belongs to neither.
    const keep = current.slice(-OVERLAP_SENTENCES);
    const keepIdx = currentIdx.slice(-OVERLAP_SENTENCES);
    current = [...keep];
    currentIdx = [...keepIdx];
  };

  for (let i = 0; i < parts.length; i++) {
    const candidate = [...current, parts[i]].join(" ");
    const tokens = estimateTokens(candidate);

    // Hard ceiling. Never emit a passage the embedding model would truncate.
    if (current.length && tokens > MAX_TOKENS) {
      flush();
      current = current.length ? current : [];
    }

    // Semantic boundary, but only once the passage is worth ending. Breaking at
    // every topic shift on a corpus this dense produces 20-token fragments that
    // retrieve on one word and explain nothing, which is the failure mode the
    // section-per-chunk design was avoiding in the first place.
    if (current.length && embeddings && estimateTokens(current.join(" ")) >= MIN_TOKENS) {
      const prev = embeddings[currentIdx[currentIdx.length - 1]];
      const next = embeddings[i];
      if (prev && next && cosine(prev, next) < BREAK_BELOW) flush();
    }

    current.push(parts[i]);
    currentIdx.push(i);
  }

  if (current.length) {
    const text = current.join(" ");
    // A trailing fragment is merged back rather than shipped. A 30-token
    // passage is a sentence with a rank, not a unit of meaning.
    if (passages.length && estimateTokens(text) < MIN_TOKENS / 2) {
      const last = passages[passages.length - 1];
      const merged = `${last.text} ${parts[parts.length - 1]}`;
      passages[passages.length - 1] = { ...last, text: merged, tokens: estimateTokens(merged) };
    } else {
      passages.push({ parent, ordinal: passages.length, text, tokens: estimateTokens(text) });
    }
  }

  /*
   * The ceiling, enforced after the fact as well as during.
   *
   * The loop checks before adding a sentence, and the tail below does not check
   * at all, so a passage could still finish over the limit -- measured at 181
   * tokens against a 150 ceiling. That matters because the ceiling exists to
   * keep every passage inside the embedding model's window; a passage over it
   * is silently truncated by the model and indexed as something other than what
   * it says.
   *
   * A single sentence longer than the ceiling cannot be split without cutting
   * mid-clause, so it is kept whole and reported. Anything else is divided at a
   * sentence boundary.
   */
  const bounded: Passage[] = [];
  for (const p of passages) {
    if (p.tokens <= MAX_TOKENS) {
      bounded.push(p);
      continue;
    }
    let buf: string[] = [];
    for (const sentence of sentences(p.text)) {
      if (buf.length && estimateTokens([...buf, sentence].join(" ")) > MAX_TOKENS) {
        const text = buf.join(" ");
        bounded.push({ parent, ordinal: bounded.length, text, tokens: estimateTokens(text) });
        buf = [];
      }
      buf.push(sentence);
    }
    if (buf.length) {
      const text = buf.join(" ");
      const last = bounded[bounded.length - 1];
      /*
       * The tail of a split, merged back when it is too small to stand alone.
       *
       * The main loop already merges a short trailing passage; this loop did
       * not, and it produced an 18-token passage in Publications containing
       * "Detection and fix together run in 13.5 seconds against 25.4 for static
       * analysis" -- the headline measurement of the paper, alone, with no
       * subject. It would rank only for a query that already knew the numbers.
       *
       * Merging can push the previous passage slightly over the ceiling. That
       * is the better failure: the ceiling protects against silent truncation
       * by the embedding model, and a few tokens of headroom exist for exactly
       * this, whereas an orphaned figure is unretrievable at any size.
       */
      if (last && estimateTokens(text) < MIN_TOKENS / 2) {
        const merged = `${last.text} ${text}`;
        bounded[bounded.length - 1] = { ...last, text: merged, tokens: estimateTokens(merged) };
      } else {
        bounded.push({ parent, ordinal: bounded.length, text, tokens: estimateTokens(text) });
      }
    }
  }

  return bounded.map((p, ordinal) => ({ ...p, ordinal }));
}
