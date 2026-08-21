import { streamWithFailover, listPrice, failoverState } from "./model";
import type { RetrievalTrace } from "./retrieve";
import { retrieve } from "./retrieve";
import {
  classify,
  systemPrompt,
  cleanAnswer,
  deflection,
  looksLikeReasoning,
  AUTHORISATION_ANSWER,
  POLICY_PREVIEW,
} from "./policy";
import prewarm from "./prewarm.json";

/**
 * Streaming path for the agent.
 *
 * The non-streaming graph stays as it is: it backs the evals and the hero's
 * measured trace, where a single settled answer is what gets asserted against.
 * This runs the same three stages for a visitor who is waiting, and emits each
 * one as it completes so text appears while the model is still producing it.
 *
 * Server-Sent Events rather than a socket. The traffic is one-directional and
 * request-scoped, so a persistent connection would add reconnect handling and
 * an idle timeout on serverless hosting to solve a problem this shape does not
 * have. EventSource also reconnects on its own, which a raw socket does not.
 */
export type StreamEvent =
  | { type: "route"; route: string; ms: number }
  | { type: "sources"; titles: string[]; ms: number; trace?: RetrievalTrace }
  | { type: "token"; text: string }
  | {
      type: "done";
      total: number;
      usage: { in: number; out: number } | null;
      /** Which provider actually produced the tokens, and on what model. */
      provider?: string | null;
      model?: string | null;
      /** What the same tokens cost at that model's published list rate. */
      listPrice?: number | null;
      /** Providers currently benched by a rate limit, with seconds remaining. */
      failover?: { name: string; coolingOffFor: number }[];
      /** True when the turn was answered from the build-time cache. */
      warm?: boolean;
      /** True when no provider was reachable and the retrieved source was
       *  served unsummarised instead of failing. */
      degraded?: boolean;
      /** The system prompt, context elided. Shown on request in the trace. */
      policy?: string;
    }
  | { type: "error"; message: string };

type Warm = Record<string, { answer: string; sources: string[]; timings: Record<string, number> }>;

/**
 * What was already said in this conversation.
 *
 * The graph's own comment claimed "conversation history is passed in per
 * request instead", and it was not: nothing accepted history, so every
 * follow-up was answered as if it were the first thing anyone had asked. A
 * reader who asked "what did he do at IMG Systems" and then "why did he do it
 * that way" got a generic answer to the second question, which reads exactly
 * like a page that does not know what it is talking about.
 *
 * Held in the browser tab and sent per request, which is the design the
 * checkpointer decision assumed. Bounded to the last two exchanges: enough to
 * resolve "it", "that" and "why", short enough that the prompt does not grow
 * without limit on a public endpoint someone else is paying for.
 */
export type Exchange = { question: string; answer: string };

const HISTORY_TURNS = 2;
const HISTORY_ANSWER_CHARS = 400;

function historyMessages(history: Exchange[]) {
  return history.slice(-HISTORY_TURNS).flatMap((h) => [
    { role: "user", content: h.question },
    { role: "assistant", content: h.answer.slice(0, HISTORY_ANSWER_CHARS) },
  ]);
}

/**
 * Retrieval sees the conversation too, not just the latest question.
 *
 * "Why did he do it that way" has no retrievable terms of its own. Searching
 * the corpus for it returns whatever is generically closest, which is how a
 * follow-up ended up grounded in the wrong section. Prepending the previous
 * question puts the subject back into the query without letting an old topic
 * outweigh the new one.
 */
function retrievalQuery(question: string, history: Exchange[]) {
  const previous = history.at(-1)?.question;
  return previous ? `${previous} ${question}` : question;
}

export async function* runStream(
  question: string,
  history: Exchange[] = [],
): AsyncGenerator<StreamEvent> {
  const started = Date.now();

  // Openers were answered at build time. Serving them from the bundle costs a
  // map lookup instead of an embedding call plus a model round trip, which is
  // the difference between an instant demo and a three second wait on the one
  // interaction most visitors have.
  // Only on a first turn. A cached answer cannot take the conversation into
  // account, and serving one mid-thread is how a follow-up gets answered with
  // the opener's reply.
  const warm = history.length === 0 ? (prewarm as Warm)[question.toLowerCase().trim()] : undefined;
  if (warm) {
    yield { type: "route", route: "answer", ms: 0 };
    yield { type: "sources", titles: warm.sources, ms: 0 };
    yield { type: "token", text: warm.answer };
    // Flagged rather than served silently. A zero-millisecond answer with no
    // explanation reads as a canned script, which is the exact opposite of what
    // this box is trying to demonstrate; labelled, it reads as a cache.
    yield {
      type: "done",
      total: Date.now() - started,
      usage: null,
      warm: true,
      policy: POLICY_PREVIEW,
    };
    return;
  }

  const route = classify(question);
  yield { type: "route", route, ms: Date.now() - started };

  // Deflections and the authorisation answer are fixed text. Streaming them a
  // character at a time would fake latency that is not there.
  if (route !== "answer" && route !== "handoff") {
    const text = route === "authorisation" ? AUTHORISATION_ANSWER : deflection(question);
    yield { type: "sources", titles: [], ms: 0 };
    yield { type: "token", text };
    // No provider is named here because none was called. That is the point of
    // the deflection path and the trace should show it rather than imply a model
    // considered the question and declined.
    yield { type: "done", total: Date.now() - started, usage: null, policy: POLICY_PREVIEW };
    return;
  }

  const retrieveStart = Date.now();
  const { chunks, trace } = await retrieve(retrievalQuery(question, history));
  yield {
    type: "sources",
    titles: chunks.map((c) => c.title),
    ms: Date.now() - retrieveStart,
    // The full fusion, every chunk, so the page can draw what actually
    // happened rather than an illustration of it.
    trace,
  };

  const context = chunks.map((c) => `## ${c.title}\n${c.body}`).join("\n\n");

  try {
    /**
     * Reasoning has to be stripped before a token reaches the browser.
     *
     * The previous version applied cleanAnswer to the buffer on every chunk and
     * emitted whatever was longer than last time, which cannot work: a token
     * already sent cannot be taken back. cleanAnswer removes a leading
     * reasoning paragraph, but it can only recognise one once a *second*
     * paragraph exists, and by then the first had already been streamed. A
     * visitor asking about Growaza was shown the model deliberating -- "So
     * answer: ... Probably focus on his contributions ... We must lead with" --
     * which is the single worst thing this box can display and the exact defect
     * the corpus claims is guarded.
     *
     * So nothing is emitted until it is safe to emit. The opening is held while
     * it still looks like working; the moment a paragraph break arrives, or
     * enough text has accumulated to show the answer started immediately, the
     * cleaned text is released and the rest streams normally. The cost is a
     * short delay on the first words of an answer that begins with reasoning,
     * which is the only case where the delay exists at all.
     */
    let buffer = "";
    let emitted = 0;
    let releasing = false;

    // Long enough to tell an answer from an opening like "We need to", short
    // enough that a normal answer starts streaming almost immediately.
    const DECIDE_AFTER = 48;
    let usage: { in: number; out: number } | null = null;
    let served: { provider: string; model: string } | null = null;

    for await (const token of streamWithFailover(
      [
        { role: "system", content: systemPrompt(context) },
        ...historyMessages(history),
        { role: "user", content: question },
      ],
      (u) => {
        usage = u;
      },
      (provider, model) => {
        served = { provider, model };
      },
    )) {
      buffer += token;

      if (!releasing) {
        const hasBreak = /\n{2,}/.test(buffer) || /<\/think>/i.test(buffer);
        // A paragraph boundary is what cleanAnswer needs to judge the opening.
        // Failing that, text this long that does not read as working is the
        // answer itself and should not be held any longer.
        if (hasBreak) releasing = true;
        else if (buffer.length >= DECIDE_AFTER && !looksLikeReasoning(buffer)) releasing = true;
        else continue;
      }

      const clean = cleanAnswer(buffer);
      if (clean.length > emitted) {
        yield { type: "token", text: clean.slice(emitted) };
        emitted = clean.length;
      }
    }

    // A short answer that never reached the release threshold still has to be
    // sent. Cleaned first, because this is the path a fully-buffered reply from
    // a non-streaming provider takes.
    const final = cleanAnswer(buffer);
    if (final.length > emitted) {
      yield { type: "token", text: final.slice(emitted) };
      emitted = final.length;
    }

    const settled = served as { provider: string; model: string } | null;
    yield {
      type: "done",
      total: Date.now() - started,
      usage,
      provider: settled?.provider ?? null,
      model: settled?.model ?? null,
      listPrice: usage && settled ? listPrice(settled.model, usage) : null,
      failover: failoverState(),
      policy: POLICY_PREVIEW,
    };
  } catch {
    /**
     * Every provider is down, and the answer degrades rather than erroring.
     *
     * The corpus has claimed exactly this since the site was built -- "with no
     * provider reachable, the agent returns the retrieved source paragraph
     * instead of a failure" -- and it was true of the non-streaming graph, which
     * backs the evals, and false of the streaming path, which is the only one a
     * visitor ever touches. So the page described a degradation it did not
     * perform, and the reader who hit it got "The model is unavailable" on a
     * page whose whole argument is that it stays useful when things break.
     *
     * The retrieval already succeeded; only the summarising failed. Serving the
     * top chunk unsummarised gives the reader the grounded material and says
     * plainly that it is unsummarised, which is worth more than an apology.
     */
    const grounded = chunks[0]?.body.split("\n\n").find((p) => p.trim().length > 0);

    if (grounded) {
      yield {
        type: "token",
        text: `${grounded.replace(/\*\*/g, "")}\n\nThat is the source text, unsummarised: every model provider is rate-limited right now. Retrieval still ran, and the sources above are the ones it chose.`,
      };
      yield {
        type: "done",
        total: Date.now() - started,
        usage: null,
        degraded: true,
        failover: failoverState(),
        policy: POLICY_PREVIEW,
      };
      return;
    }

    yield { type: "error", message: "The model is unavailable. Reach him directly by email." };
  }
}
