export const runtime = "nodejs";

const ALLOWED = new Set([
  "view",
  "scroll_deep",
  "agent_opened",
  "agent_asked",
  "voice_used",
  "contact",
]);

/**
 * Funnel sink.
 *
 * Writes to the platform log rather than a database: the question being answered
 * is "does this page convert", which needs counts over days, not rows. No IP, no
 * user agent, no identifier is recorded, so there is nothing here to leak and
 * nothing to put in a privacy policy.
 */
export async function POST(req: Request) {
  try {
    const { event, detail } = await req.json();
    if (typeof event === "string" && ALLOWED.has(event)) {
      const clean = typeof detail === "string" ? detail.slice(0, 120) : "";
      console.log(`funnel ${event}${clean ? ` ${JSON.stringify(clean)}` : ""}`);
    }
  } catch {
    // Malformed beacon. Nothing to do and nothing worth surfacing.
  }
  // 204 so a beacon never retries and never blocks unload.
  return new Response(null, { status: 204 });
}
