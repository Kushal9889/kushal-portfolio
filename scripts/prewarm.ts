import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ask } from "../lib/agent/graph";

/**
 * Answers the opener questions at build time.
 *
 * The three openers are fixed strings and they are what most visitors click, so
 * paying two to four seconds of model latency for them at request time is a cost
 * with no upside. Answering them during the build makes the first thing a visitor
 * does instant, and leaves the streaming path for questions that are genuinely
 * unpredictable.
 *
 * Regenerated on every build, so a change to the corpus changes these too. If a
 * question fails here the entry is skipped rather than baked wrong, and it falls
 * through to the live path.
 */
const OPENERS = [
  "What has he shipped on Azure?",
  "What broke in production and how did he find it?",
  "How does he decide when multi-agent is worth it?",
];

async function main() {
  const warm: Record<string, unknown> = {};

  for (const question of OPENERS) {
    try {
      const result = await ask(question);
      if (result.answer && result.route === "answer") {
        warm[question.toLowerCase().trim()] = result;
        console.log(`prewarm: ${result.total}ms  ${question}`);
      }
    } catch {
      console.log(`prewarm: skipped  ${question}`);
    }
  }

  const out = join(process.cwd(), "lib", "agent", "prewarm.json");
  writeFileSync(out, JSON.stringify(warm, null, 2));
  console.log(`prewarm: ${Object.keys(warm).length} of ${OPENERS.length} baked`);
}

main();
