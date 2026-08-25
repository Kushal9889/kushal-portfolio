import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ask } from "../lib/agent/graph";
import { CASES } from "../lib/agent/evals";
import { listPrice, streamWithFailover } from "../lib/agent/model";
import { systemPrompt } from "../lib/agent/policy";

/**
 * Which model should answer, decided by measurement.
 *
 * The page picks one model out of the hundred-odd reachable on one key, and
 * "it seemed fast" is not a reason. This runs the real pipeline -- the same
 * retrieval, the same prompt, the same cleaning -- against several models and
 * reports what each actually did.
 *
 * Three decisions here come from how badly this is usually done.
 *
 * **Warmup is discarded.** The first request to a model pays connection setup
 * and whatever the provider does on a cold route. Counting it measures the
 * network, not the model.
 *
 * **Every case runs several times.** Only about a third of published benchmarks
 * repeat their experiment at all, and repeated runs of the same suite against
 * the same model have been measured swinging nineteen points. A single run is a
 * sample of one and cannot tell a better model from a good afternoon.
 *
 * **The pass rate carries a confidence interval, and the winner is only
 * declared when the intervals do not overlap.** Leaderboard ranks routinely sit
 * inside each other's error bars, which makes the ordering partly noise. When
 * two models here cannot be told apart, this says so and falls back to latency,
 * which is measured far more precisely than correctness at this sample size.
 */

/** Reachable on the key, verified before this list was written. */
const MODELS = [
  "nvidia/nemotron-3-nano-30b-a3b",
  "nvidia/nemotron-3.5-lightning-30b-a3b",
  "nvidia/nemotron-mini-4b-instruct",
  "meta/llama-3.1-8b-instruct",
  "openai/gpt-oss-20b",
];

/**
 * Only the cases where a model actually answers.
 *
 * Deflections, the authorisation reply and the tool path never reach a model --
 * that is the point of the policy layer -- so including them would score every
 * model identically on a third of the suite and quietly flatter all of them.
 */
const SCORED = CASES.filter((c) => c.route === "answer" && (c.expect || c.expectAny || c.reject));

const RUNS = Number(process.env.BENCH_RUNS ?? 4);

/**
 * Wilson score interval for a proportion.
 *
 * The normal approximation is wrong at small samples and near the ends, which
 * is exactly where this benchmark lives: a model at 100% would get an interval
 * of zero width from the textbook formula, implying certainty that forty-four
 * observations cannot support. Wilson stays sane at both.
 */
function wilson(passes: number, total: number, z = 1.96): [number, number] {
  if (total === 0) return [0, 1];
  const p = passes / total;
  const d = 1 + (z * z) / total;
  const centre = (p + (z * z) / (2 * total)) / d;
  const margin = (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) / d;
  return [Math.max(0, centre - margin), Math.min(1, centre + margin)];
}

/**
 * A confidence interval on a percentile, by resampling the measurements.
 *
 * The pass rate got an interval and the latency did not, and the latency turned
 * out to need one more. Run the same five models twice and llama-3.1-8b's p95
 * moved from 4717ms to 2113ms while gpt-oss-20b's moved from 6002ms to
 * 10204ms -- the same models, the same suite, minutes apart. A tiebreak on a
 * single run's p95 is reading noise exactly as much as ranking on a single
 * run's pass rate, which is the thing this file exists to avoid doing.
 *
 * There is no closed form for the variance of a percentile, so it is
 * bootstrapped: resample the observed latencies with replacement, recompute the
 * percentile, and take the middle 95% of those. It costs no extra requests --
 * it is arithmetic on measurements already taken.
 */
function bootstrapPct(xs: number[], q: number, iterations = 2000): [number, number] {
  if (xs.length < 4) return [0, 0];
  // Deterministic, so a rerun with the same measurements gives the same
  // interval and a change in the number means a change in the data.
  let seed = 20260822;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const estimates: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const sample: number[] = [];
    for (let n = 0; n < xs.length; n++) sample.push(xs[Math.floor(rand() * xs.length)]);
    sample.sort((a, b) => a - b);
    estimates.push(sample[Math.min(sample.length - 1, Math.floor(sample.length * q))]);
  }
  estimates.sort((a, b) => a - b);
  return [
    estimates[Math.floor(iterations * 0.025)],
    estimates[Math.floor(iterations * 0.975)],
  ];
}

const pct = (xs: number[], q: number) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * q))] ?? 0;
};

type Row = {
  model: string;
  passes: number;
  total: number;
  rate: number;
  low: number;
  high: number;
  p50: number;
  p95: number;
  p95Low: number;
  p95High: number;
  p99: number;
  ttft: number | null;
  tokensOut: number;
  costPerAnswer: number | null;
  failures: string[];
};

/**
 * Time to the first visible token, which is the only latency a reader feels
 * before they decide whether the page works.
 *
 * Measured on the streaming path rather than derived from the totals above: a
 * settled answer and a first word are different events, and a model can be
 * quick to start and slow to finish or the reverse. One call per model, after
 * the warmup, with a context the same shape as a real one.
 */
async function firstToken(model: string): Promise<number | null> {
  process.env.NVIDIA_MODEL = model;
  const context = "## Growaza\nMeasured: -30% API response time\nHe cut API response time 30 percent using in-memory caching.";
  const started = Date.now();
  try {
    for await (const token of streamWithFailover([
      { role: "system", content: systemPrompt(context) },
      { role: "user", content: "Tell me about Growaza" },
    ])) {
      if (token) return Date.now() - started;
    }
    return null;
  } catch {
    return null;
  }
}

async function measure(model: string): Promise<Row> {
  process.env.NVIDIA_MODEL = model;

  // Warmup, discarded. The first call pays route setup that is not the model's.
  try {
    await ask("What has he shipped on Azure?");
  } catch {
    // A model that cannot even warm up will show up as failures below.
  }

  const latencies: number[] = [];
  const failures: string[] = [];
  let passes = 0;
  let total = 0;
  let tokensOut = 0;
  let usageIn = 0;
  let usageOut = 0;

  for (const c of SCORED) {
    for (let run = 0; run < RUNS; run++) {
      total++;
      try {
        const r = await ask(c.question);
        latencies.push(r.total);
        tokensOut += r.usage?.out ?? 0;
        usageIn += r.usage?.in ?? 0;
        usageOut += r.usage?.out ?? 0;

        const answer = (r.answer ?? "").toString();
        const problems: string[] = [];
        if (r.route !== c.route) problems.push(`routed ${r.route}`);
        for (const t of c.expect ?? []) if (!answer.includes(t)) problems.push(`missing "${t}"`);
        if (c.expectAny && !c.expectAny.some((t) => answer.includes(t))) problems.push("no expected term");
        for (const t of c.reject ?? []) if (answer.toLowerCase().includes(t.toLowerCase())) problems.push(`leaked "${t}"`);
        if (c.minChars && answer.trim().length < c.minChars) problems.push("too short");

        if (problems.length === 0) passes++;
        else if (failures.length < 6) failures.push(`${c.question} — ${problems.join("; ")}`);
      } catch (err) {
        if (failures.length < 6) failures.push(`${c.question} — ${(err as Error).message.slice(0, 60)}`);
      }
    }
  }

  const ttft = await firstToken(model);
  const [low, high] = wilson(passes, total);
  const answers = Math.max(1, latencies.length);

  return {
    model,
    passes,
    total,
    rate: +(passes / Math.max(1, total)).toFixed(3),
    low: +low.toFixed(3),
    high: +high.toFixed(3),
    p50: pct(latencies, 0.5),
    p95: pct(latencies, 0.95),
    p95Low: bootstrapPct(latencies, 0.95)[0],
    p95High: bootstrapPct(latencies, 0.95)[1],
    p99: pct(latencies, 0.99),
    ttft,
    tokensOut: Math.round(tokensOut / answers),
    costPerAnswer:
      usageIn + usageOut > 0
        ? listPrice(model, { in: usageIn / answers, out: usageOut / answers })
        : null,
    failures,
  };
}

async function main() {
  const rows: Row[] = [];
  for (const model of MODELS) {
    process.stdout.write(`measuring ${model} ... `);
    const row = await measure(model);
    rows.push(row);
    console.log(`${row.passes}/${row.total}  p50 ${row.p50}ms`);
  }

  // Correctness first, latency as the tiebreak. Ordering by latency alone would
  // reward a model that is fast because it says less.
  rows.sort((a, b) => b.rate - a.rate || a.p50 - b.p50);

  console.log(
    "\n" +
      "model".padEnd(40) +
      "pass".padEnd(10) +
      "95% interval".padEnd(18) +
      "TTFT".padEnd(9) +
      "p50".padEnd(9) +
      "p95".padEnd(9) +
      "p99",
  );
  for (const r of rows) {
    console.log(
      r.model.padEnd(40) +
        `${r.passes}/${r.total}`.padEnd(10) +
        `${(r.low * 100).toFixed(0)}-${(r.high * 100).toFixed(0)}%`.padEnd(18) +
        `${r.ttft ?? "-"}ms`.padEnd(9) +
        `${r.p50}ms`.padEnd(9) +
        `${r.p95}ms`.padEnd(9) +
        `${r.p99}ms`,
    );
  }

  /*
   * A winner only when the intervals separate.
   *
   * If the best model's lower bound sits below the runner-up's upper bound, the
   * two are indistinguishable at this sample size and claiming one is better is
   * reading noise. Saying so is the finding.
   */
  const [best, second] = rows;
  const separated = second ? best.low > second.high : true;
  const tied = rows.filter((r) => r.high >= best.low).map((r) => r.model);

  console.log("");
  if (separated) {
    console.log(`${best.model} is ahead on correctness, and the intervals do not overlap.`);
  } else {
    console.log(
      `${tied.length} models are indistinguishable on correctness at ${best.total} observations ` +
        `each: ${tied.join(", ")}.\nTheir confidence intervals overlap, so the ranking between ` +
        `them is noise. Latency decides, and it is measured far more precisely.`,
    );
  }
  /*
   * The tiebreak is p95, not p50, and the difference changes the answer.
   *
   * On this run the median favours llama-3.1-8b at 996ms against the
   * incumbent's 1209ms, and the tail reverses it: 4717ms against 3131ms at p95,
   * 5004ms against 4107ms at p99. A median is what a benchmark feels; a tail is
   * what a reader feels, and the reader who hits it is the one still waiting.
   *
   * Stated before the numbers rather than chosen after them: p95 is the metric
   * this whole pipeline has been tuned against -- it is the number the output
   * token cap was set by -- so using it here is consistency, not a result
   * picked to flatter the incumbent. The p50 ordering is printed anyway, so the
   * choice is visible rather than buried.
   */
  const among = [...rows].filter((r) => tied.includes(r.model));
  const fastest = [...among].sort((a, b) => a.p95 - b.p95)[0];

  /*
   * And the same test again, on the tail.
   *
   * If the fastest model's p95 interval overlaps a rival's, the two cannot be
   * separated on latency either, and there is nothing left to choose on. The
   * honest move then is to keep whatever already ships: switching on a
   * difference the measurement cannot resolve is churn wearing a decision's
   * clothes.
   */
  const latencyTied = among.filter((r) => r.p95Low <= fastest.p95High && r.model !== fastest.model);
  const incumbent = MODELS[0];
  const decided = latencyTied.length === 0;

  console.log(
    `\nOn the tail, ${fastest.model} is fastest at p95 ${fastest.p95}ms ` +
      `[${fastest.p95Low}-${fastest.p95High}].`,
  );
  if (!decided) {
    console.log(
      `Its interval overlaps ${latencyTied.map((r) => `${r.model} [${r.p95Low}-${r.p95High}]`).join(", ")}, ` +
        `so latency does not separate them either.\nNothing here justifies a change: keeping ${incumbent}.`,
    );
  }

  for (const r of rows) {
    if (r.failures.length) {
      console.log(`\n${r.model} missed:`);
      for (const f of r.failures) console.log(`  ${f}`);
    }
  }

  writeFileSync(
    join(process.cwd(), "content", "models.json"),
    JSON.stringify(
      {
        note: "Generated by `npm run bench:models`. Do not edit by hand.",
        measured: new Date().toISOString().slice(0, 10),
        cases: SCORED.length,
        runs: RUNS,
        observations: rows[0]?.total ?? 0,
        // The honest headline: whether this benchmark can tell them apart.
        separated,
        indistinguishable: separated ? [] : tied,
        chosen: separated ? best.model : decided ? fastest.model : incumbent,
        chosenOn: separated
          ? "correctness, intervals separated"
          : decided
            ? "p95 latency, correctness indistinguishable"
            : "neither correctness nor latency separated; kept the incumbent",
        latencySeparated: decided,
        results: rows,
      },
      null,
      2,
    ) + "\n",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
