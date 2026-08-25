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
  | "research"
  | "credentials";

/**
 * Subject lines are the part an inbox shows before anything else, so they carry
 * the specific hook and nothing else.
 *
 * The general subject used to read "Your portfolio, and a role I think fits".
 * That is a claim about who is writing, made before anyone has written a word,
 * and it was wrong for every sender who was not a recruiter. A subject line
 * states what the message is about; who the sender is, is theirs to say.
 */
export const SUBJECT: Record<ReachContext, string> = {
  general: "Your portfolio",
  opensource: "The LangChain deepagents fix",
  measured: "The eval suite on your site",
  approach: "How your retrieval fusion works",
  work: "Your work at the Questrom Computational Lab",
  // Section 05 became Research and kept pointing at the projects context, so a
  // reader who had just read about the IEEE paper got a draft about BU Life AI.
  research: "Your paper on contextual bug detection",
  // Section 06 became Credentials. The context was still called `projects` and
  // still opened a draft about a side project that no longer has a heading
  // there, so the one section a reader reaches after the certifications sent a
  // message about something else entirely.
  credentials: "Your NVIDIA certification",
};

/**
 * Openers are written in the SENDER's voice, and claim nothing on their behalf.
 *
 * Two rules, both learned from the version this replaces.
 *
 * First: state what they read, not how they felt about it. The previous
 * openers admired -- "I spent a while on the retrieval figure", "I had a look
 * at" -- and admiration in a stranger's outbox reads as flattery they did not
 * choose to send.
 *
 * Second: never assert who the sender is. Every previous body ended with "I am
 * hiring for a role I think could be a fit", which meant an engineer, a
 * classmate or a former colleague who clicked had a false claim typed into
 * their outbox under their own name. The file's own comment two paragraphs up
 * promised "not a message pretending to be from them"; that line broke the
 * promise. The ask is neutral now, and works whoever is writing.
 */
export const OPENER: Record<ReachContext, string> = {
  general: "I came across your portfolio and read through it.",
  opensource:
    "I read about the CompositeBackend bug you reported to LangChain, and the fix that was merged 57 hours later.",
  measured:
    "I looked at the eval suite behind the agent on your site, and the latency you publish alongside it.",
  approach:
    "I read how retrieval works on your site, including the point where the dense retriever overrules keyword rank.",
  work: "I read about the agentic RAG platform you shipped on Azure at the Questrom Computational Lab.",
  research: "I read your ICAICCIT paper on contextual bug detection.",
  credentials:
    "I went through your credentials, including the NVIDIA agentic AI certification.",
};

/**
 * The ask, identical in every draft.
 *
 * Choosing a time is the real work in a reply, and a message that leaves it
 * open gets answered with "sure, when?" and then not answered again. Naming two
 * is one line for the sender and removes the whole round trip.
 */
const ASK =
  "I'd like to talk to you about it. If you're open to a short call, name two times that suit you and I'll take one.";

/** Kept short deliberately: a long prefilled body is a form, and a form is work. */
function body(context: ReachContext, site: string) {
  return [OPENER[context], "", ASK, "", `(Sent from ${site})`, ""].join("\n");
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
 * The same draft as plain text, for when `mailto:` does nothing.
 *
 * A locked-down corporate machine with no mail client registered, and a reader
 * living in webmail, both get the same result from a `mailto:` link: the click
 * lands, nothing opens, and the page looks broken at the exact moment someone
 * decided to act. There is no event for that failure, so it cannot be detected
 * and has to be covered instead. Every caller that opens a draft can also hand
 * over the identical text to paste.
 */
export function mailDraft(email: string, site: string, context: ReachContext = "general") {
  return {
    to: email,
    subject: SUBJECT[context],
    body: body(context, site).trimEnd(),
  };
}

/** LinkedIn refuses a note longer than this, and truncates without saying so. */
export const LINKEDIN_NOTE_LIMIT = 300;

/**
 * LinkedIn cannot be handed a prefilled message by URL.
 *
 * The message parameter on /messaging/thread was removed, and the connect flow
 * accepts no note from a link. Anything claiming otherwise sends the reader to
 * a dead screen, which is worse than sending them to the profile. So the
 * profile opens, and the note is copied to their clipboard at the same moment,
 * with a line on the page telling them it is there. One paste instead of one
 * blank box.
 *
 * Trimmed to the connection-note limit rather than trusted to fit. The previous
 * version appended a hiring claim to the longest opener and never checked the
 * total, so the two longest contexts were over the cap and LinkedIn would have
 * cut them mid-sentence in front of the person being written to.
 */
export function linkedinNote(context: ReachContext = "general") {
  const note = `${OPENER[context]} I'd like to talk about it. Are you open to a short call?`;
  if (note.length <= LINKEDIN_NOTE_LIMIT) return note;
  // Cut at a sentence end rather than mid-word, so a trimmed note still reads
  // as something a person wrote.
  const room = note.slice(0, LINKEDIN_NOTE_LIMIT);
  return room.slice(0, room.lastIndexOf(". ") + 1) || room.trimEnd();
}

/**
 * The three lines an internal employee forwards, rather than the page a
 * recruiter reads.
 *
 * Most hires that come from a portfolio do not come from the person who found
 * it. They come from that person pasting something into a channel, and what
 * they paste is whatever is short enough to paste. A URL alone forces the next
 * reader to open a tab before they know whether it is worth one, so the three
 * strongest facts travel with it, and the link is the condensed view, which is
 * the version that survives being opened on a phone in a meeting.
 *
 * Generated from the corpus like everything else here. Nothing in it is a
 * second copy of a fact.
 */
export function forwardBlurb(
  profile: { name: string; current: string; proof: string; site: string },
  evals: { passed: number; cases: number; p50: number },
) {
  return [
    `${profile.name} - ${profile.current}.`,
    profile.proof,
    `His site runs a live agent over his own resume: ${evals.passed}/${evals.cases} eval assertions pass, ${evals.p50}ms median answer.`,
    `${profile.site}?mode=condensed`,
  ].join("\n");
}
