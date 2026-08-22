import { ask } from "@/lib/agent/graph";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * The hero's one query.
 *
 * Runs a fixed question through the real graph and returns what it measured.
 * The hero renders measured numbers or none at all, which is the whole point: a
 * hardcoded latency is the easiest claim on a page like this to check and the
 * most damaging one to get caught on.
 *
 * It used to return the per-node timings and discard everything else `ask()`
 * produced -- the token usage, which provider served it, the total. The
 * telemetry strip in the hero then had a bar and no numbers beside it on first
 * load, because the only request a visitor who asks nothing ever makes is this
 * one. Cost and provider were measured and thrown away one function call before
 * the thing that wanted them.
 *
 * Cached briefly so a burst of visitors does not each pay for the same answer.
 * The timings stay honest because they are the timings of a real run; the cache
 * window just decides how recent that run was.
 */
const QUESTION = "What has he shipped on Azure?";
const TTL_MS = 60_000;

type Demo = {
  /** The question, returned rather than duplicated in the hero. */
  question: string;
  /** What it actually said. The hero printed timings for a request whose answer
   *  it discarded, so the strongest thing this page does -- answer a real
   *  question about him, correctly, in under two seconds -- was invisible to
   *  anyone who did not type. */
  answer: string;
  sources: string[];
  timings: Record<string, number>;
  total: number;
  usage: { in: number; out: number } | null;
  provider: string | null;
};

let cached: { at: number; demo: Demo } | null = null;

export async function GET() {
  if (cached && Date.now() - cached.at < TTL_MS) {
    return Response.json(cached.demo, {
      headers: { "cache-control": "public, max-age=30" },
    });
  }

  try {
    const { answer, sources, timings, total, usage, provider } = await ask(QUESTION);
    const demo: Demo = {
      question: QUESTION,
      answer: (answer ?? "").toString(),
      sources: sources ?? [],
      timings,
      total,
      usage: usage ?? null,
      provider: provider ?? null,
    };
    cached = { at: Date.now(), demo };
    return Response.json(demo, { headers: { "cache-control": "public, max-age=30" } });
  } catch {
    // The hero handles this by showing the graph structure with no numbers.
    return new Response(null, { status: 503 });
  }
}
