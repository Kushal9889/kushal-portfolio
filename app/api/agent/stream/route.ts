import { runStream } from "@/lib/agent/stream";
import { checkBudget } from "@/lib/agent/budget";

import { loadContent } from "@/lib/content";

export const runtime = "nodejs";

const { profile } = loadContent();
export const maxDuration = 30;

/**
 * Streaming agent endpoint.
 *
 * Server-Sent Events over a plain GET so EventSource can consume it directly,
 * including its own reconnect behaviour. The question rides in the query string
 * because EventSource cannot send a request body.
 */
export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const question = (new URL(req.url).searchParams.get("q") ?? "").slice(0, 500);

  if (question.trim().length < 2) {
    return Response.json({ error: "ask something" }, { status: 400 });
  }

  const budget = checkBudget(ip, question);

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        if (!budget.ok) {
          send({ type: "route", route: "deflect", ms: 0 });
          send({
            type: "token",
            // The address was typed here while every other surface reads it
            // from the corpus, so a change to his email would have left one
            // dead route behind. The reason ships with the limit: a public LLM
            // endpoint with no ceiling is a stranger spending someone else's
            // credit, and saying so turns a wall into a decision.
            text: `That is the token ceiling for this demo. It is capped on purpose: this endpoint is public and uncapped inference on a free tier is a stranger spending his credit. He answers faster than the agent anyway, at ${profile.email}.`,
          });
          send({ type: "done", total: 0, usage: null });
          return;
        }

        for await (const event of runStream(question)) send(event);
      } catch {
        send({ type: "error", message: "Stream failed. Reach him directly by email." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
