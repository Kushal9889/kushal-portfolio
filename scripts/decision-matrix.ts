import { writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Decision coupling matrix.
 *
 * The graph diagrams show the shape. This shows the arithmetic: every decision
 * against every other decision, and how many other decisions each one moves.
 *
 * The reason to compute it rather than draw it is that the interesting number is
 * not visible in a diagram. A node with high reach is one where a change is
 * expensive, and those are not the nodes that look important. The palette choice
 * reaches further than the framework choice does.
 */

type Node = {
  id: string;
  domain: string;
  label: string;
  /** Decisions this one forces. Direction matters: A forces B is not B forces A. */
  forces: string[];
  /** Audit rows this decision is the reason for. The third axis. */
  satisfies?: string[];
};

const NODES: Node[] = [
  { id: "cost", domain: "D3", label: "zero cost", forces: ["ondevice", "noVectorDb", "failover", "sse", "freeModel"], satisfies: ["3.3"] },
  { id: "verifiable", domain: "D1", label: "nothing unverifiable", forces: ["corpus", "measured", "credLinks", "cleanAnswer", "linkCI"], satisfies: ["1.9", "6.7"] },
  { id: "noSignature", domain: "D2", label: "no machine-made signature", forces: ["palette", "typefaces", "scrollCss", "noMetaComments", "silhouette"], satisfies: ["2.1", "2.4"] },

  { id: "palette", domain: "D5", label: "warm paper, one accent", forces: ["accentMeansLive", "lintTokens"], satisfies: ["5.3", "5.4"] },
  { id: "accentMeansLive", domain: "D5", label: "accent means live only", forces: ["linksUnderlined", "emphasisScale", "verifyLinkInk"], satisfies: ["5.4", "5.8"] },
  { id: "emphasisScale", domain: "D5", label: "emphasis by scale and weight", forces: ["metricsStrip", "boldCap"], satisfies: ["5.7"] },
  { id: "linksUnderlined", domain: "D5", label: "links underlined", forces: [], satisfies: ["5.8"] },
  { id: "metricsStrip", domain: "D5", label: "metrics lifted from prose", forces: ["scanLandsOnFigure"], satisfies: ["5.7", "6.3"] },
  { id: "boldCap", domain: "D5", label: "one bold claim per section", forces: [], satisfies: ["5.8"] },
  { id: "scanLandsOnFigure", domain: "D6", label: "six-second scan lands on a figure", forces: [], satisfies: ["6.1", "6.3"] },
  { id: "verifyLinkInk", domain: "D10", label: "credential link is ink", forces: ["apcaPass"], satisfies: ["10.7"] },
  { id: "typefaces", domain: "D5", label: "Instrument Serif + Martian Mono", forces: [], satisfies: ["2.2"] },
  { id: "scrollCss", domain: "D5", label: "scroll-driven CSS only", forces: ["supportsGuard"], satisfies: ["5.6"] },
  { id: "supportsGuard", domain: "D10", label: "@supports fallback", forces: ["reducedMotion"], satisfies: ["5.6", "10.2"] },
  { id: "reducedMotion", domain: "D10", label: "reduced motion honoured", forces: [], satisfies: ["10.2"] },
  { id: "lintTokens", domain: "D7", label: "lint forbids stray colour", forces: [], satisfies: ["2.1", "7.4"] },
  { id: "silhouette", domain: "D2", label: "silhouette test", forces: [], satisfies: ["2.8"] },
  { id: "apcaPass", domain: "D10", label: "APCA >= 75", forces: [], satisfies: ["10.7"] },

  { id: "ondevice", domain: "D4", label: "on-device speech", forces: ["lazyModel", "gestureHonesty"], satisfies: ["3.3", "4.6"] },
  { id: "lazyModel", domain: "D4", label: "TTS loads lazily", forces: ["heroTypeOnly"], satisfies: ["4.6"] },
  { id: "gestureHonesty", domain: "D4", label: "no audio before a gesture", forces: ["micErrorVisible"], satisfies: ["6.9"] },
  { id: "micErrorVisible", domain: "D4", label: "blocked mic says so", forces: [], satisfies: ["4.7"] },
  { id: "heroTypeOnly", domain: "D6", label: "hero carried by typography", forces: [], satisfies: ["6.1"] },

  { id: "noVectorDb", domain: "D4", label: "index baked into bundle", forces: ["measured", "noColdStart"], satisfies: ["3.3", "7.3"] },
  { id: "noColdStart", domain: "D8", label: "no database on request path", forces: [], satisfies: ["7.3"] },
  { id: "failover", domain: "D3", label: "provider failover", forces: ["cooldown", "cleanAnswer"], satisfies: ["3.4", "3.5"] },
  { id: "cooldown", domain: "D3", label: "cooldown on refusal", forces: [], satisfies: ["3.4"] },
  { id: "freeModel", domain: "D4", label: "free-tier model", forces: ["specificityTrade", "prewarm"], satisfies: ["3.3"] },
  { id: "specificityTrade", domain: "D6", label: "quality over 600ms", forces: [], satisfies: ["4.10", "6.3"] },
  { id: "prewarm", domain: "D4", label: "openers answered at build", forces: ["instantDemo"], satisfies: ["4.10"] },
  { id: "instantDemo", domain: "D6", label: "16ms on the common path", forces: ["fogg"], satisfies: ["4.10", "6.1"] },
  { id: "sse", domain: "D4", label: "SSE not WebSocket", forces: ["noRetryOnDrop"], satisfies: ["4.5", "4.11"] },
  { id: "noRetryOnDrop", domain: "D4", label: "no auto re-ask", forces: [], satisfies: ["4.5"] },

  { id: "corpus", domain: "D1", label: "single source of truth", forces: ["credLinks", "llmsTxt", "ogCard", "factsGate"], satisfies: ["1.1", "7.1"] },
  { id: "measured", domain: "D1", label: "measured numbers only", forces: ["tracePanel", "liveGraph"], satisfies: ["1.9", "9.1"] },
  { id: "tracePanel", domain: "D4", label: "trace behind a control", forces: [], satisfies: ["4.3", "9.1"] },
  { id: "liveGraph", domain: "D5", label: "live graph in the hero", forces: ["signatureMoment"], satisfies: ["9.1", "6.6"] },
  { id: "signatureMoment", domain: "D5", label: "exactly one signature", forces: ["noThreeD"], satisfies: ["5.2", "6.4"] },
  { id: "noThreeD", domain: "D5", label: "no second 3D moment", forces: [], satisfies: ["5.9"] },
  { id: "credLinks", domain: "D1", label: "every credential links", forces: ["linkCI"], satisfies: ["1.3", "1.4", "1.5", "6.7"] },
  { id: "linkCI", domain: "D8", label: "links checked in CI", forces: [], satisfies: ["7.4", "8.2"] },
  { id: "llmsTxt", domain: "D9", label: "llms.txt", forces: [], satisfies: ["9.4"] },
  { id: "ogCard", domain: "D9", label: "share card from corpus", forces: [], satisfies: ["9.5"] },
  { id: "factsGate", domain: "D7", label: "facts gate", forces: ["emDashGate"], satisfies: ["7.1", "7.4"] },
  { id: "emDashGate", domain: "D2", label: "em-dash rate gate", forces: [], satisfies: ["2.3"] },
  { id: "cleanAnswer", domain: "D7", label: "strip leaked reasoning", forces: ["credibilityIntact"], satisfies: ["7.6"] },
  { id: "credibilityIntact", domain: "D6", label: "persuasion layer survives", forces: [], satisfies: ["6.6"] },
  { id: "noMetaComments", domain: "D2", label: "no meta-commentary in code", forces: [], satisfies: ["2.5", "2.7"] },

  { id: "fogg", domain: "D6", label: "agent above the fold", forces: ["lcpElement", "conversion"], satisfies: ["6.2"] },
  { id: "lcpElement", domain: "D8", label: "agent is the LCP element", forces: ["lazyModel"], satisfies: ["8.3"] },
  { id: "conversion", domain: "D6", label: "clipboard opening line", forces: [], satisfies: ["6.10"] },
];

const byId = new Map(NODES.map((n) => [n.id, n]));
for (const n of NODES) {
  for (const f of n.forces) {
    if (!byId.has(f)) throw new Error(`${n.id} forces unknown node "${f}"`);
  }
}

/** Everything a decision reaches, following edges to exhaustion. */
function reach(start: string): Set<string> {
  const seen = new Set<string>();
  const stack = [...(byId.get(start)?.forces ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    stack.push(...(byId.get(id)?.forces ?? []));
  }
  return seen;
}

const stats = NODES.map((n) => {
  const downstream = reach(n.id);
  const upstream = NODES.filter((o) => reach(o.id).has(n.id)).length;
  return { ...n, direct: n.forces.length, downstream: downstream.size, upstream };
}).sort((a, b) => b.downstream - a.downstream || b.upstream - a.upstream);

const lines: string[] = [];
lines.push("# Decision coupling matrix");
lines.push("");
lines.push("Generated by `npm run decision-matrix`. Do not edit by hand.");
lines.push("");
lines.push(`${NODES.length} decisions. \`forces\` counts direct edges; \`reaches\` counts every`);
lines.push("decision downstream once edges are followed to exhaustion; `held by` counts the");
lines.push("decisions upstream that would move this one.");
lines.push("");
lines.push("## Ranked by blast radius");
lines.push("");
lines.push("| decision | domain | forces | reaches | held by |");
lines.push("|---|---|---|---|---|");
for (const s of stats) {
  lines.push(`| ${s.label} | ${s.domain} | ${s.direct} | ${s.downstream} | ${s.upstream} |`);
}

lines.push("");
lines.push("## Adjacency");
lines.push("");
lines.push("Rows force columns. `1` is a direct edge, `.` is reachable but indirect.");
lines.push("");
const ids = stats.map((s) => s.id);
const width = Math.max(...ids.map((i) => i.length));
lines.push("```");
lines.push(" ".repeat(width + 1) + ids.map((_, i) => String(i % 10)).join(""));
ids.forEach((rowId, r) => {
  const row = reach(rowId);
  const direct = new Set(byId.get(rowId)!.forces);
  const cells = ids.map((colId) => (direct.has(colId) ? "1" : row.has(colId) ? "." : " "));
  lines.push(`${rowId.padEnd(width)} ${cells.join("")}  ${String(r % 10)}`);
});
lines.push("```");

// Third axis: decision -> audit requirement. Answers the question the other two
// cannot, which is what breaks downstream in the audit if this decision changes.
lines.push("");
lines.push("## Decisions to audit rows");
lines.push("");
lines.push("Changing a decision invalidates the evidence for every row listed against");
lines.push("it and against everything it reaches. Re-verify those rows, not the whole audit.");
lines.push("");
lines.push("| decision | satisfies directly | at risk if changed |");
lines.push("|---|---|---|");
for (const s of stats) {
  const own = s.satisfies ?? [];
  const downstreamReqs = new Set<string>();
  for (const id of reach(s.id)) for (const r of byId.get(id)?.satisfies ?? []) downstreamReqs.add(r);
  for (const r of own) downstreamReqs.delete(r);
  if (!own.length && !downstreamReqs.size) continue;
  lines.push(
    `| ${s.label} | ${own.join(", ") || "\u2014"} | ${[...downstreamReqs].sort().join(", ") || "\u2014"} |`,
  );
}

const covered = new Set(NODES.flatMap((n) => n.satisfies ?? []));
lines.push("");
lines.push(`${covered.size} audit rows are traceable to a decision. Rows with no decision behind`);
lines.push("them are either content facts or gates, which have no design coupling.");

const roots = stats.filter((s) => s.upstream === 0);
const leaves = stats.filter((s) => s.direct === 0);
lines.push("");
lines.push("## Reading it");
lines.push("");
lines.push(`**Roots** (nothing upstream, so changing one re-decides the page): ${roots.map((r) => r.label).join(", ")}.`);
lines.push("");
lines.push(`**Leaves** (${leaves.length} of ${NODES.length}) force nothing and are safe to change alone.`);
lines.push("");
const top = stats[0];
lines.push(
  `**Highest blast radius**: "${top.label}" reaches ${top.downstream} of ${NODES.length - 1} other decisions. ` +
    "That is the one to think hardest about before touching.",
);

writeFileSync(join(process.cwd(), "docs", "decision-matrix.md"), lines.join("\n") + "\n");
console.log(`decision-matrix: ${NODES.length} nodes, top reach "${top.label}" = ${top.downstream}`);
