/**
 * One tokenizer, used to build the index and to score a query against it.
 *
 * It was two. `scripts/build-index.ts` had a copy and `lib/agent/retrieve.ts`
 * had a near-copy differing only in a stopword filter, and nothing kept them in
 * step. BM25 scores a query against tokens produced at index time, so two
 * tokenizers that drift produce terms the query can never match -- silently,
 * with no error and no failing test, because both halves are individually
 * correct.
 *
 * The rule about punctuation is the part that carries weight. Dropping it
 * entirely destroys the exact strings people actually type here -- "Node.js",
 * "10.1109/ICAICCIT", "NCP-AAI", "-30%", "gpt-4o" -- and those are precisely
 * the queries the lexical half exists to catch. Keeping all of it splits every
 * sentence-final word into its own term.
 *
 * Measured on this corpus before the fix: of 1,342 indexed terms, **169 ended
 * in a full stop, and 90 of those had a clean twin already in the index**.
 * "production" and "production." were two different terms with two different
 * document frequencies, so a query for "production" could not match any
 * sentence that ended with it, and the IDF of both was wrong. That had been
 * true since the index was first built.
 *
 * So punctuation is kept inside a token and stripped from its edges.
 */

/** Kept inside a token, stripped from the ends. */
const EDGE = /^[.\-]+|[.\-]+$/g;

/**
 * Characters that survive at all.
 *
 * `+`, `#`, `.` and `-` stay because they are load-bearing in this corpus:
 * C++, C#, version numbers, DOIs, hyphenated identifiers and negative metrics
 * like "-30%". Everything else becomes a separator.
 */
const KEEP = /[^a-z0-9+#.\-\s]/g;

export function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(KEEP, " ")
    .split(/\s+/)
    .map((t) => t.replace(EDGE, ""))
    .filter((t) => t.length > 1);
}

/**
 * Words that carry no signal in a corpus that is entirely about one person.
 *
 * BM25 down-weights common terms through IDF, and on a corpus this small that
 * is not nearly enough: "he" appears in most passages and still scores, "what"
 * in many. Combined with length normalisation, which rewards short documents, a
 * short passage could outrank the one that actually answers the question purely
 * on the strength of matching the question's grammar.
 *
 * Pronouns are here for a reason specific to this corpus rather than to
 * English: every passage is about the same person, so "he" and "his" are closer
 * to punctuation than to content.
 *
 * Applied to queries only. The index keeps them, so document lengths stay
 * honest and BM25's length normalisation is computed against real prose.
 */
export const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one",
  "our", "out", "day", "get", "has", "him", "his", "how", "its", "new", "now", "old", "see",
  "two", "way", "who", "did", "yes", "let", "put", "say", "she", "too", "use", "that", "with",
  "this", "have", "from", "they", "been", "were", "what", "when", "there", "their", "would",
  "about", "which", "them", "than", "then", "into", "only", "some", "just", "over", "also",
  // "he" and "his" are not an oversight and not a duplicate. The list they came
  // from carried "his" twice, and deduplicating it removed both pronouns
  // instead of the repeat -- which put them back into every query as search
  // terms, on a corpus where every passage is about the same person. The
  // integration suite caught it in the same run.
  "does", "doing", "done", "any", "he", "his", "at", "in", "on", "of", "to", "is", "it", "as",
  "an", "by", "or", "be", "do", "we", "if", "so", "up", "me", "my", "us", "tell",
]);

/** Index-time: every token, stopwords included. */
export function indexTokens(text: string): string[] {
  return normalize(text);
}

/** Query-time: the same tokens, minus the grammar. */
export function queryTokens(text: string): string[] {
  return normalize(text).filter((t) => !STOPWORDS.has(t));
}
