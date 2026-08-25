/**
 * Offer types and the acceptance test, with nothing that touches the disk.
 *
 * Split out of followups.ts on purpose. That module reads the corpus through
 * `loadContent`, which is `node:fs`, and the client needs two things from this
 * feature: the shape of an offer so it can render one, and the acceptance test
 * so a typed "yes" opens the thing that was offered without a round trip.
 *
 * Importing followups.ts from a "use client" component to get those two would
 * pull the corpus loader into the browser bundle. That is not hypothetical --
 * it already happened once on this page, when a client component imported the
 * retriever for four numbers and Next.js duly bundled eighteen 1024-dimension
 * vectors into a chunk the browser downloaded. Client JS went from 4256KB to
 * 2876KB when it was found. A file with no imports cannot do that.
 */

export type Offer =
  /** Opens something real. `url` is resolved by `npm run verify:links` at build. */
  | { kind: "open"; label: string; url: string; what: string }
  /** Asks a question the corpus is known to answer. */
  | { kind: "ask"; label: string; question: string };

/**
 * "yes".
 *
 * The reader is offered something and answers in the shortest way a person
 * answers. That reply carries no retrievable terms, so sending it to the
 * retriever returns whatever is generically closest and the agent answers a
 * question nobody asked -- which is exactly how an assistant stops feeling like
 * it is listening.
 *
 * Matched here instead, against the offer that was actually on screen. Kept
 * deliberately narrow: anything longer than a bare acceptance is a real
 * question that happens to start with "yes", and belongs to the retriever.
 * "Yes please" accepts; "yes, what about Azure?" does not.
 */
const ACCEPT =
  /^\s*(?:yes|yeah|yep|yup|sure|ok|okay|go on|do it|open it|show me|pull it up|sounds good|let'?s see it)\b[\s,.!]*(?:please|thanks|thank you)?[\s.!]*$/i;

export function isAcceptance(text: string): boolean {
  return text.trim().length <= 24 && ACCEPT.test(text);
}
