import { streamWithFailover } from "./model";
import type { RetrievalTrace } from "./retrieve";
import { retrieve } from "./retrieve";
import { classify, systemPrompt, cleanAnswer, deflection, AUTHORISATION_ANSWER } from "./policy";
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
  | { type: "done"; total: number; usage: { in: number; out: number } | null }
  | { type: "error"; message: string };

type Warm = Record<string, { answer: string; sources: string[]; timings: Record<string, number> }>;

export async function* runStream(question: string): AsyncGenerator<StreamEvent> {
  const started = Date.now();

  // Openers were answered at build time. Serving them from the bundle costs a
  // map lookup instead of an embedding call plus a model round trip, which is
  // the difference between an instant demo and a three second wait on the one
  // interaction most visitors have.
  const warm = (prewarm as Warm)[question.toLowerCase().trim()];
  if (warm) {
    yield { type: "route", route: "answer", ms: 0 };
    yield { type: "sources", titles: warm.sources, ms: 0 };
    yield { type: "token", text: warm.answer };
    yield { type: "done", total: Date.now() - started, usage: null };
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
    yield { type: "done", total: Date.now() - started, usage: null };
    return;
  }

  const retrieveStart = Date.now();
  const { chunks, trace } = await retrieve(question);
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
    // Reasoning has to be stripped before a token reaches the browser, and the
    // markers arrive split across chunks. Text is held back until it is known
    // not to be part of a think block, which costs a little smoothness at the
    // start and avoids showing a visitor the model's working.
    let buffer = "";
    let emitted = 0;
    let usage: { in: number; out: number } | null = null;

    for await (const token of streamWithFailover([
      { role: "system", content: systemPrompt(context) },
      { role: "user", content: question },
    ], (u) => {
      usage = u;
    })) {
      buffer += token;
      const clean = cleanAnswer(buffer);
      if (clean.length > emitted) {
        yield { type: "token", text: clean.slice(emitted) };
        emitted = clean.length;
      }
    }

    yield { type: "done", total: Date.now() - started, usage };
  } catch {
    yield { type: "error", message: "The model is unavailable. Reach him directly by email." };
  }
}
