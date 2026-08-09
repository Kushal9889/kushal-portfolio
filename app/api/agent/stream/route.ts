import { runStream } from "@/lib/agent/stream";
import { checkBudget } from "@/lib/agent/budget";

export const runtime = "nodejs";
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
            text: "That is the daily limit for this demo. Reach him directly at kushal7887pd@gmail.com.",
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
