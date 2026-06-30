/**
 * Per-IP spend guard.
 *
 * Budgeted in tokens rather than requests, because request count is a poor proxy
 * for cost when one question can be twenty times another. A public LLM endpoint
 * with no ceiling is a way to hand a stranger your credit balance.
 *
 * ponytail: in-memory, so on serverless the counter is per warm instance rather
 * than global. That is enough to stop a single client hammering one instance,
 * which is the realistic abuse case for a portfolio. Move to Upstash Redis if
 * this ever needs to hold across instances.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_TOKENS = Number(process.env.AGENT_DAILY_TOKEN_BUDGET ?? 20_000);

type Bucket = { spent: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Rough token estimate. Four characters per token is close enough to budget on. */
function estimate(text: string): number {
  return Math.ceil(text.length / 4) + Number(process.env.AGENT_MAX_OUTPUT_TOKENS ?? 400);
}

export function checkBudget(ip: string, question: string) {
  const now = Date.now();
  const cost = estimate(question);

  let bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    bucket = { spent: 0, resetAt: now + DAY_MS };
    buckets.set(ip, bucket);
  }

  if (bucket.spent + cost > DAILY_TOKENS) {
    return { ok: false as const, remaining: 0 };
  }

  bucket.spent += cost;

  // Bounded so a flood of unique addresses cannot grow the map without limit.
  if (buckets.size > 5000) {
    for (const [key, b] of buckets) {
      if (now > b.resetAt) buckets.delete(key);
    }
  }

  return { ok: true as const, remaining: DAILY_TOKENS - bucket.spent };
}
