import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { invokeWithFailover, activeProvider } from "./model";
import { retrieve, type Chunk, type RetrievalTrace } from "./retrieve";
import {
  classify,
  systemPrompt,
  cleanAnswer,
  deflection,
  handoffAnswer,
  AUTHORISATION_ANSWER,
} from "./policy";

/**
 * The agent behind this site.
 *
 *                     ┌──▶ retrieve ──▶ answer ──▶ END
 *   START ──▶ route ──┼──▶ deflect ──────────────▶ END
 *                     └──▶ handoff ──────────────▶ END
 *
 * Compiled without a checkpointer. LangGraph persists state after every node by
 * default, which is the right default for long-running stateful agents and the
 * wrong one here: a Postgres saver costs 20-50ms per write, and this graph runs
 * three nodes to answer a question in a conversation that lives in the browser
 * tab. Conversation history is passed in per request instead.
 */

const State = Annotation.Root({
  question: Annotation<string>,
  intent: Annotation<string>,
  chunks: Annotation<Chunk[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  reply: Annotation<string>,
  /** Token usage reported by the provider. Absent when no model was called. */
  usage: Annotation<{ in: number; out: number } | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  /**
   * The fusion the retriever performed, carried on the state rather than thrown
   * away at the node boundary.
   *
   * retrieve() has always built a complete trace and the streaming path has
   * always forwarded it, but the graph dropped it on the floor, so anything not
   * driven by a browser -- the eval suite, the prewarm script, a future export --
   * could not see which half of the hybrid retriever decided the answer. The
   * suite now counts how often the embedding round trip was skipped, which is a
   * number the page publishes.
   */
  trace: Annotation<RetrievalTrace | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  /** Which provider served the answer. Failover is real and was never visible. */
  provider: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  /** Per-node wall time, surfaced in the trace panel and the hero. */
  timings: Annotation<Record<string, number>>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({}),
  }),
});

type S = typeof State.State;

/** Wraps a node so every one of them is timed the same way, with no per-node bookkeeping. */
function timed(name: string, fn: (s: S) => Promise<Partial<S>>) {
  return async (state: S): Promise<Partial<S>> => {
    const start = performance.now();
    const result = await fn(state);
    return { ...result, timings: { [name]: Math.round(performance.now() - start) } };
  };
}

const route = timed("route", async (state) => ({
  intent: classify(state.question),
}));

const retrieveNode = timed("retrieve", async (state) => {
  const { chunks, trace } = await retrieve(state.question);
  return { chunks, trace };
});

const answer = timed("answer", async (state) => {
  const context = state.chunks.map((c) => `## ${c.title}\n${c.body}`).join("\n\n");

  // No provider configured, or every one of them failed. Returning the retrieved
  // source beats an error: the visitor still gets the grounded material, just
  // unsummarised, and the page around it keeps working.
  const fallback = () => ({
    reply: state.chunks[0]?.body.split("\n\n")[0] ?? deflection(state.question),
    usage: null,
    provider: null,
  });

  if (!activeProvider()) return fallback();

  try {
    const { text, usage, provider } = await invokeWithFailover([
      { role: "system", content: systemPrompt(context) },
      { role: "user", content: state.question },
    ]);
    return {
      // Stripped here rather than inside the provider adapter: the adapter's job
      // is transport, and reasoning leakage is a property of the answer.
      reply: cleanAnswer(state.intent === "handoff" ? handoffAnswer(text) : text),
      usage,
      provider,
    };
  } catch {
    return fallback();
  }
});

const deflect = timed("deflect", async (state) => ({
  reply:
    state.intent === "authorisation" ? AUTHORISATION_ANSWER : deflection(state.question),
}));

export const graph = new StateGraph(State)
  .addNode("route", route)
  .addNode("retrieve", retrieveNode)
  .addNode("answer", answer)
  .addNode("deflect", deflect)
  .addEdge(START, "route")
  .addConditionalEdges("route", (s: S) => (s.intent === "deflect" || s.intent === "authorisation" ? "deflect" : "retrieve"), {
    deflect: "deflect",
    retrieve: "retrieve",
  })
  .addEdge("retrieve", "answer")
  .addEdge("answer", END)
  .addEdge("deflect", END)
  .compile();

export async function ask(question: string) {
  const started = performance.now();
  const result = await graph.invoke({ question });
  return {
    answer: result.reply,
    route: result.intent,
    timings: result.timings,
    total: Math.round(performance.now() - started),
    sources: result.chunks.map((c) => c.title),
    usage: result.usage,
    trace: result.trace,
    provider: result.provider,
  };
}
