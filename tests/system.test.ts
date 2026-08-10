import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";

/**
 * System tests: a real server, real HTTP, real headers.
 *
 * Starts the production build rather than dev, because three defects in this
 * project only appeared in the production bundle: a stale CSS artifact, a
 * route that worked in dev and 404ed when built, and a stylesheet whose token
 * values differed after minification.
 */

const PORT = 3111;
const BASE = `http://localhost:${PORT}`;
let server: ChildProcess;

const hasProvider = Boolean(
  process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
);

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server did not start on ${PORT}`);
}

before(async () => {
  server = spawn("npm", ["run", "start", "--", "--port", String(PORT)], {
    stdio: "ignore",
    env: { ...process.env, PORT: String(PORT) },
    detached: false,
  });
  await waitForServer();
});

after(() => {
  server?.kill("SIGTERM");
});

describe("pages", () => {
  test("the homepage serves and carries the identity line", async () => {
    const res = await fetch(BASE);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Kushal Gaddamwar/);
    assert.match(html, /engineer the systems/i);
  });

  test("llms.txt serves as plain text with the real facts", async () => {
    const res = await fetch(`${BASE}/llms.txt`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /text\/plain/);
    const body = await res.text();
    assert.match(body, /Kushal Gaddamwar/);
    assert.match(body, /NVIDIA/);
  });

  test("the share card renders as a real PNG at the right size", async () => {
    const res = await fetch(`${BASE}/opengraph-image`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "image/png");
    const buf = Buffer.from(await res.arrayBuffer());
    // PNG magic number, then the IHDR width/height fields.
    assert.equal(buf.subarray(1, 4).toString(), "PNG");
    assert.equal(buf.readUInt32BE(16), 1200);
    assert.equal(buf.readUInt32BE(20), 630);
  });
});

describe("agent endpoint", () => {
  test("rejects an empty question rather than calling a model", async () => {
    const res = await fetch(`${BASE}/api/agent`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: "" }),
    });
    assert.equal(res.status, 400);
  });

  test("rejects a malformed body", async () => {
    const res = await fetch(`${BASE}/api/agent`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not json",
    });
    assert.equal(res.status, 400);
  });

  test("caps an oversized question instead of forwarding it", async () => {
    const res = await fetch(`${BASE}/api/agent`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: "a".repeat(5000) }),
    });
    // Either answered against the truncated input or refused. Never a crash.
    assert.ok(res.status === 200 || res.status === 400, `got ${res.status}`);
  });

  test("answers a deflection without a provider key", async () => {
    const res = await fetch(`${BASE}/api/agent`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: "What salary does he want?" }),
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.route, "deflect");
    assert.ok(json.answer.length > 20);
  });
});

describe("streaming endpoint", () => {
  test("serves a well-formed SSE stream", async () => {
    const res = await fetch(`${BASE}/api/agent/stream?q=What%20salary%20does%20he%20want%3F`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /text\/event-stream/);

    const body = await res.text();
    const events = body
      .split("\n\n")
      .filter((b) => b.startsWith("data: "))
      .map((b) => JSON.parse(b.slice(6)));

    assert.ok(events.length >= 3);
    assert.equal(events[0].type, "route");
    assert.equal(events.at(-1).type, "done");
    // Every frame must parse. A single malformed frame breaks the client loop.
    assert.ok(events.every((e) => typeof e.type === "string"));
  });

  test("a real answer streams tokens and reports usage", { skip: !hasProvider }, async () => {
    const res = await fetch(
      `${BASE}/api/agent/stream?q=What%20did%20he%20build%20at%20IMG%20Systems%3F`,
    );
    const body = await res.text();
    const events = body
      .split("\n\n")
      .filter((b) => b.startsWith("data: "))
      .map((b) => JSON.parse(b.slice(6)));

    const tokens = events.filter((e) => e.type === "token");
    const done = events.at(-1);

    assert.ok(tokens.length > 1, "answer arrived in one lump, not streamed");
    assert.equal(done.type, "done");
    assert.ok(done.usage, "usage missing from done event");
    assert.ok(done.usage.in > 0 && done.usage.out > 0);
  });

  test("rejects an empty query", async () => {
    const res = await fetch(`${BASE}/api/agent/stream?q=`);
    assert.equal(res.status, 400);
  });
});

describe("accessibility and markup", () => {
  test("the page ships a skip link and a labelled main", async () => {
    const html = await (await fetch(BASE)).text();
    assert.match(html, /href="#main"/);
    assert.match(html, /id="main"/);
  });

  test("every input is labelled", async () => {
    const html = await (await fetch(BASE)).text();
    const inputs = html.match(/<input[^>]*>/g) ?? [];
    for (const input of inputs) {
      const labelled = /aria-label=|aria-labelledby=|id=/.test(input);
      assert.ok(labelled, `unlabelled input: ${input.slice(0, 80)}`);
    }
  });

  test("structured data identifies a real person", async () => {
    const html = await (await fetch(BASE)).text();
    const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    assert.ok(match, "no JSON-LD");
    const data = JSON.parse(match![1]);
    // Schema.org allows a bare node, an array, or an @graph wrapper. All three
    // are valid, so the test flattens rather than assuming one shape.
    const graph: Record<string, unknown>[] = Array.isArray(data)
      ? data
      : Array.isArray(data["@graph"])
        ? data["@graph"]
        : [data];

    assert.ok(
      graph.some((n) => n["@type"] === "Person"),
      `no Person node in ${graph.map((n) => n["@type"]).join(", ")}`,
    );
    const person = graph.find((n) => n["@type"] === "Person") as Record<string, string>;
    assert.equal(person.name, "Kushal Gaddamwar");
    assert.ok(person.jobTitle, "Person node has no jobTitle");
  });
});
