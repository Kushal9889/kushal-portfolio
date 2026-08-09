import { ask } from "@/lib/agent/graph";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * The hero's one query.
 *
 * Runs a fixed question through the real graph and returns only the per-node
 * timings. The hero renders measured numbers or none at all, which is the whole
 * point: a hardcoded latency is the easiest claim on a page like this to check
 * and the most damaging one to get caught on.
 *
 * Cached briefly so a burst of visitors does not each pay for the same answer.
 * The timings stay honest because they are the timings of a real run; the cache
 * window just decides how recent that run was.
 */
const QUESTION = "What has he shipped on Azure?";
const TTL_MS = 60_000;

let cached: { at: number; timings: Record<string, number> } | null = null;

export async function GET() {
  if (cached && Date.now() - cached.at < TTL_MS) {
    return Response.json(cached.timings, {
      headers: { "cache-control": "public, max-age=30" },
    });
  }

  try {
    const { timings } = await ask(QUESTION);
    cached = { at: Date.now(), timings };
    return Response.json(timings, { headers: { "cache-control": "public, max-age=30" } });
  } catch {
    // The hero handles this by showing the graph structure with no numbers.
    return new Response(null, { status: 503 });
  }
}
