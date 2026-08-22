import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

/**
 * Every custom property that is used must be defined.
 *
 * This exists because three of them were not, and nothing anywhere noticed.
 * `--t-normal` was used four times in the hero and never declared, so every
 * transition on the live pipeline node was invalid at computed value and the
 * dot, its ring and its 1.35x scale all snapped. `--t-mid` did the same to the
 * whole topology graph. `--step--2` did it to three elements, which silently
 * rendered at their parent's size instead of stepping down.
 *
 * None of that throws. A bad `var()` is not a parse error: the declaration is
 * simply dropped, the property keeps its inherited or initial value, and the
 * page renders looking almost right. It is the same class of silent failure the
 * published research is about, and it had been sitting in the most important
 * animation on the site for weeks.
 *
 * A fallback counts as a definition: `var(--x, 250ms)` is a deliberate default,
 * not a typo. Everything else has to resolve against a real declaration.
 */

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".next", ".netlify", ".git", "out", "dist"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if ([".css", ".tsx", ".ts"].includes(extname(entry))) out.push(path);
  }
  return out;
}

const files = [
  ...walk(join(ROOT, "app")),
  ...walk(join(ROOT, "lib")),
];

/**
 * Declarations, from anywhere.
 *
 * A property declared in a component stylesheet is still a real declaration, so
 * the whole tree is scanned rather than only globals.css. Properties set from
 * JavaScript count too: several are written as inline style, which is how the
 * retrieval figure staggers and how the trace bars are sized.
 */
const defined = new Set<string>();
/** Every `var()` reference, fallback or not. Drives the unused report. */
const referenced = new Set<string>();
/** Only references with no fallback. Drives the failure. */
const used = new Map<string, string[]>();

for (const file of files) {
  const src = readFileSync(file, "utf8");

  for (const m of src.matchAll(/(--[a-zA-Z][\w-]*)\s*:/g)) defined.add(m[1]);
  // Set from script: el.style.setProperty("--w", ...) and the ["--w"]: form
  for (const m of src.matchAll(/["'\[]\s*(--[a-zA-Z][\w-]*)\s*["'\]]/g)) defined.add(m[1]);
  // Registered with @property
  for (const m of src.matchAll(/@property\s+(--[a-zA-Z][\w-]*)/g)) defined.add(m[1]);

  for (const m of src.matchAll(/var\(\s*(--[a-zA-Z][\w-]*)\s*([,)])/g)) {
    referenced.add(m[1]);
    // A fallback is a deliberate default rather than a missing token, so it
    // counts as a reference but never as a missing definition.
    if (m[2] === ",") continue;
    const at = src.slice(0, m.index).split("\n").length;
    used.set(m[1], [...(used.get(m[1]) ?? []), `${file.replace(ROOT + "/", "")}:${at}`]);
  }
}

const missing = [...used.entries()].filter(([name]) => !defined.has(name));

/**
 * Declared and never read.
 *
 * Reported rather than failed. A token can legitimately exist ahead of the code
 * that uses it, and a design system is allowed a vocabulary wider than today's
 * page. It is still worth seeing.
 */
const unused = [...defined].filter(
  (name) => !referenced.has(name) && !name.startsWith("--font") && !name.startsWith("--brand"),
);

console.log(`${defined.size} custom properties defined, ${referenced.size} referenced`);

if (unused.length) {
  console.log(`\n  declared and never read (${unused.length}):`);
  for (const name of unused.sort()) console.log(`    ${name}`);
}

if (missing.length) {
  console.error(`\n  used and never defined (${missing.length}):`);
  for (const [name, where] of missing.sort()) {
    console.error(`    ${name}`);
    for (const site of where.slice(0, 6)) console.error(`      ${site}`);
    if (where.length > 6) console.error(`      ... and ${where.length - 6} more`);
  }
  console.error("\n  A dropped var() is not a parse error. It renders almost right.");
  process.exit(1);
}

console.log("\nevery referenced custom property resolves");
