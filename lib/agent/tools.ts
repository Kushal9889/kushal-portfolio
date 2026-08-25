import { loadContent } from "../content";
import { mailtoLink, mailDraft, type ReachContext } from "../reach";
import { CASES } from "./evals";

const { profile, sections } = loadContent();

/**
 * What the agent can do, as opposed to what it can say.
 *
 * Four verbs, and the rule is not the count: no two of these could ever be the
 * right answer to the same request. A reader asking to see the merged fix wants
 * `open_evidence`; a reader asking to write to him wants `compose_intro`; a
 * reader who does not believe the eval number wants `run_eval`. If a person
 * cannot say which tool applies, a model cannot either, and an overlapping pair
 * is a selection error waiting to happen.
 *
 * Two decisions shape everything below.
 *
 * **No loop.** The model is called once, with tools and without the corpus, and
 * whatever it asks for is executed and rendered. Nothing is fed back for a
 * second opinion. The dominant failure mode in production tool use is the retry
 * loop -- a tool errors, the agent re-invokes it identically, and the cost
 * compounds until a timeout kills the session. A pipeline with no second turn
 * cannot loop, and on a corpus this size there is nothing a second turn would
 * learn.
 *
 * **A failure is an answer, never an exception.** Every executor returns a
 * typed result carrying `say`, the sentence a reader gets. Tool calls fail
 * between three and fifteen percent of the time in production, and the worst
 * kind is the silent one: a call that succeeds and returns nothing, so no error
 * surfaces anywhere. So "worked" and "returned nothing" are different results
 * here, and both are sentences rather than a broken control.
 */

/** Everything a reader can be shown, gathered from the corpus, not written here. */
function targets() {
  const found = new Map<string, { url: string; label: string }>();

  // Section artifacts first. Every URL in this list is resolved by
  // `npm run verify:links` on each build, so a tool cannot open a dead page.
  for (const section of sections) {
    for (const artifact of section.artifacts) {
      const key = slug(artifact.kind, artifact.label);
      if (!found.has(key)) found.set(key, { url: artifact.url, label: artifact.label });
    }
  }

  // Then the three links that belong to him rather than to a section.
  found.set("linkedin", { url: profile.linkedin, label: "his LinkedIn profile" });
  found.set("github", { url: profile.github, label: "his GitHub profile" });
  found.set("repository", { url: profile.repo, label: "the source for this page" });

  return found;
}

function slug(kind: string, label: string): string {
  const k = kind.toLowerCase();
  if (k.includes("fix") || k.includes("pull")) return "merged_fix";
  if (k.includes("issue")) return "reported_issue";
  if (k.includes("ieee")) return "ieee_paper";
  if (k.includes("igi")) return "book_chapter";
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);
}

export const TARGETS = targets();

export type ToolResult =
  | { ok: true; kind: "open"; url: string; label: string; say: string }
  | { ok: true; kind: "draft"; mailto: string; subject: string; body: string; say: string }
  | { ok: true; kind: "eval"; question: string; passed: boolean; asserts: string; say: string }
  | { ok: false; say: string };

/**
 * The schemas the model sees.
 *
 * Each description answers the three questions a model actually evaluates when
 * choosing: what does this do, when should I use it, what comes back. Vague
 * descriptions are not a documentation problem, they are a routing problem --
 * the description is the prompt.
 */
export function toolSchemas() {
  return [
    {
      type: "function" as const,
      function: {
        name: "open_evidence",
        description:
          "Open a real, public artifact in the reader's browser: a merged pull request, " +
          "the issue behind it, a published paper, his LinkedIn, his GitHub, or the source " +
          "for this page. Use when the reader asks to see, open, pull up, visit or be linked " +
          "to something. Returns the label of what was opened. Do not use to describe " +
          "something; that is an ordinary answer.",
        parameters: {
          type: "object",
          properties: {
            target: {
              type: "string",
              enum: [...TARGETS.keys()],
              description: "Which artifact to open.",
            },
          },
          required: ["target"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "compose_intro",
        description:
          "Open the reader's own mail client with a complete, ready-to-send message to him, " +
          "and return the same text so it can be copied instead. Use when the reader says " +
          "they want to contact, email, reach out to, or get in touch with him. Nothing is " +
          "sent by this site; the reader sends it themselves and can edit every word.",
        parameters: {
          type: "object",
          properties: {
            about: {
              type: "string",
              enum: ["general", "opensource", "measured", "approach", "work", "research", "credentials"],
              description:
                "What the conversation was actually about, so the draft opens by naming it. " +
                "Use 'general' when nothing specific was discussed.",
            },
          },
          required: ["about"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "run_eval",
        description:
          "Run one case from this site's own evaluation suite, live, and show whether its " +
          "assertion passes. Use when the reader doubts the agent, asks how it is tested, " +
          "asks whether it makes things up, or challenges a number on the page. Returns the " +
          "case, the assertion, and the result. It can fail, and that is the point.",
        parameters: {
          type: "object",
          properties: {
            about: {
              type: "string",
              enum: ["grounding", "policy", "authorisation", "out-of-corpus"],
              description:
                "Which kind of claim to demonstrate: grounding reproduces a figure from the " +
                "corpus, policy shows a prompt override being refused, authorisation shows " +
                "the visa answer, out-of-corpus shows a question it will not invent an answer to.",
            },
          },
          required: ["about"],
        },
      },
    },
  ];
}

export function openEvidence(target: string): ToolResult {
  const found = TARGETS.get(target);
  if (!found) {
    // The model named something that is not in the corpus. Saying so is more
    // useful than opening the wrong page, and far more useful than silence.
    return {
      ok: false,
      say: `That is not something this page can open. It has his LinkedIn, his GitHub, the source for this site, the LangChain issue and fix, and his two publications.`,
    };
  }
  return {
    ok: true,
    kind: "open",
    url: found.url,
    label: found.label,
    say: `Opening ${found.label}.`,
  };
}

export function composeIntro(about: string): ToolResult {
  const context = (
    ["general", "opensource", "measured", "approach", "work", "research", "credentials"].includes(about)
      ? about
      : "general"
  ) as ReachContext;

  const draft = mailDraft(profile.email, profile.site.replace("https://", ""), context);
  return {
    ok: true,
    kind: "draft",
    mailto: mailtoLink(profile.email, profile.site.replace("https://", ""), context),
    subject: draft.subject,
    body: draft.body,
    // `mailto:` does nothing on a machine with no mail client registered and
    // nothing in webmail, and there is no event for that failure, so it cannot
    // be detected and has to be covered instead. The text comes back either way.
    say: `Opening a draft to ${profile.email}. If nothing opens, the same message is below to copy.`,
  };
}

/** How many demonstrations one reader gets before the answer is no. */
export const EVAL_SESSION_CAP = 3;

/**
 * Runs one real case and reports whether its assertion held.
 *
 * The case is chosen here rather than by the caller. A model asked for an
 * arbitrary string would eventually ask for one that does not exist, and a
 * reader could otherwise pick the twenty-two cases one at a time and spend the
 * daily budget before a recruiter arrives.
 */
export async function runEval(
  about: string,
  ask: (question: string) => Promise<{ answer: string; route: string }>,
): Promise<ToolResult> {
  const pool = CASES.filter((c) => c.group === about);
  const chosen = pool[0];
  if (!chosen) return { ok: false, say: `There is no eval case of that kind.` };

  try {
    const result = await ask(chosen.question);
    const answer = (result.answer ?? "").toString();

    const problems: string[] = [];
    if (result.route !== chosen.route) problems.push(`routed to ${result.route}, expected ${chosen.route}`);
    for (const term of chosen.expect ?? []) {
      if (!answer.includes(term)) problems.push(`missing "${term}"`);
    }
    if (chosen.expectAny && !chosen.expectAny.some((t) => answer.includes(t))) {
      problems.push(`none of [${chosen.expectAny.join(", ")}]`);
    }
    for (const term of chosen.reject ?? []) {
      if (answer.toLowerCase().includes(term.toLowerCase())) problems.push(`leaked "${term}"`);
    }

    const asserts = [
      `routes to ${chosen.route}`,
      ...(chosen.expect ?? []).map((t) => `states ${JSON.stringify(t)}`),
      ...(chosen.reject ?? []).map((t) => `never says ${JSON.stringify(t)}`),
    ].join(" · ");

    const passed = problems.length === 0;
    return {
      ok: true,
      kind: "eval",
      question: chosen.question,
      passed,
      asserts,
      say: passed
        ? `Ran it just now: "${chosen.question}" — ${asserts}. Passed.`
        : `Ran it just now: "${chosen.question}" — ${asserts}. Failed: ${problems.join("; ")}.`,
    };
  } catch (err) {
    // A demonstration that cannot run is reported as one that could not run,
    // never as one that passed.
    return { ok: false, say: `The suite could not run just now: ${(err as Error).message.slice(0, 120)}.` };
  }
}
