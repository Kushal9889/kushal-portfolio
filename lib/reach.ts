/**
 * The distance between deciding and acting.
 *
 * Every contact link on this page was a bare `mailto:`, which opens an empty
 * draft and hands the reader a blank page at the exact moment they had decided
 * to write. The cost of that blank page is paid by the person we most want to
 * hear from, and it is paid silently: nobody reports the email they did not
 * send.
 *
 * So the draft arrives written. Not a form, not a template with brackets to
 * fill, and not a message pretending to be from them. It is a short, honest
 * opener a busy person can send as-is or overwrite in two seconds, and it names
 * the specific thing the sender was reading, so the reply lands with context
 * already attached.
 *
 * Everything below is generated from `content/facts.md`. Nothing here restates
 * a fact, because a second copy of a fact is a fact that can drift.
 */

/** Where the reader was when they decided to write. Shapes the opener only. */
export type ReachContext =
  | "general"
  | "opensource"
  | "measured"
  | "approach"
  | "work"
  | "projects";

/**
 * Subject lines are the part a recruiter's inbox shows before anything else, so
 * they carry the role and the specific hook rather than a greeting.
 */
const SUBJECT: Record<ReachContext, string> = {
  general: "Your portfolio, and a role I think fits",
  opensource: "The deepagents bug you reported",
  measured: "Your eval suite",
  approach: "How your retrieval fusion works",
  work: "Your work at the Questrom Computational Lab",
  projects: "BU Life AI",
};

/**
 * Openers are written in the SENDER's voice, not his.
 *
 * A prefilled body that speaks as the reader is a small forgery, and a
 * recruiter who notices it stops trusting everything else on the page. These
 * are the four or five words a real person would type before getting to the
 * point, with the specific reference already in place so the message is not
 * generic on arrival.
 */
const OPENER: Record<ReachContext, string> = {
  general: "I came across your portfolio and wanted to get in touch.",
  opensource:
    "I read about the CompositeBackend error-swallowing bug you reported to LangChain, and the fix a maintainer merged 57 hours later.",
  measured:
    "I looked at the evaluation suite behind the agent on your site, and the latency numbers you publish with it.",
  approach:
    "I spent a while on the retrieval figure on your site, watching the dense retriever overrule keyword rank.",
  work: "I read about the agentic RAG platform you shipped on Azure at the Questrom Computational Lab.",
  projects: "I had a look at BU Life AI and the multi-agent routing behind it.",
};

/** Kept short deliberately: a long prefilled body is a form, and a form is work. */
function body(context: ReachContext, site: string) {
  return [
    OPENER[context],
    "",
    "I am hiring for a role I think could be a fit, and wanted to see whether you are open to a short conversation.",
    "",
    `(Sent from ${site})`,
    "",
  ].join("\n");
}

/**
 * `mailto:` with subject and body, encoded once.
 *
 * Newlines have to be percent-encoded rather than passed raw: an unencoded
 * newline truncates the body silently in several clients, which would ship a
 * half-written draft and look worse than no draft at all.
 */
export function mailtoLink(email: string, site: string, context: ReachContext = "general") {
  const params = new URLSearchParams({
    subject: SUBJECT[context],
    body: body(context, site),
  });
  // URLSearchParams encodes spaces as "+", which mail clients render literally
  // in a subject line. Only %20 is safe in a mailto query.
  return `mailto:${email}?${params.toString().replace(/\+/g, "%20")}`;
}

/**
 * LinkedIn cannot be handed a prefilled message by URL.
 *
 * The message parameter on /messaging/thread was removed, and the connect flow
 * accepts no note from a link. Anything claiming otherwise sends the reader to
 * a dead screen, which is worse than sending them to the profile. So the
 * profile opens, and the note is copied to their clipboard at the same moment,
 * with a line on the page telling them it is there. One paste instead of one
 * blank box.
 */
export function linkedinNote(context: ReachContext = "general") {
  return `${OPENER[context]} I am hiring for a role I think could be a fit and wanted to see whether you are open to a short conversation.`;
}
