import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Structural distinctiveness check.
 *
 * The research finding this implements: any single machine-made design tell is
 * noise, but the conjunction is diagnostic. A page reduced to its structure
 * should not be interchangeable with the template it might have come from.
 *
 * Rather than rendering a screenshot, this counts the structural signatures that
 * make generated pages look alike. A page scoring zero is not automatically good;
 * it is only not obviously templated.
 */
type Signature = { name: string; test: RegExp; found?: number };

const SIGNATURES: Signature[] = [
  { name: "AI blue (#2563EB / #3B82F6)", test: /#(2563eb|3b82f6)\b/i },
  { name: "AI violet (#8B5CF6 / #7C3AED)", test: /#(8b5cf6|7c3aed)\b/i },
  { name: "AI green (#10B981)", test: /#10b981\b/i },
  { name: "blue-to-purple gradient", test: /linear-gradient[^;]*(blue|indigo|violet|purple)/i },
  { name: "Inter / Geist / Cal Sans", test: /font-family:[^;]*\b(Inter|Geist|Cal Sans)\b/i },
  { name: "glassmorphism", test: /backdrop-filter:\s*blur/i },
  { name: "three-column feature grid", test: /grid-template-columns:\s*repeat\(3,/i },
  { name: "coloured left-border card strip", test: /border-left:\s*[34]px/i },
  { name: "uniform fade-up on everything", test: /@keyframes\s+fade-?in-?up/i },
];

/**
 * Production CSS only. `.next/dev` holds unminified per-module copies from the
 * dev server, which would double-count and can lag behind the built output.
 */
function collectCss(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "cache" || entry === "dev") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) collectCss(path, out);
    else if (path.endsWith(".css")) out.push(readFileSync(path, "utf8"));
  }
  return out;
}

let css = "";
try {
  css = collectCss(join(process.cwd(), ".next", "static")).join("\n");
} catch {
  css = "";
}

if (!css) {
  console.error("no built CSS found. run `npm run build` first.");
  process.exit(1);
}

const hits = SIGNATURES.filter((s) => s.test.test(css));

console.log(`scanned ${(css.length / 1024).toFixed(1)}KB of built CSS`);
for (const s of SIGNATURES) {
  console.log(`${s.test.test(css) ? "HIT " : "ok  "} ${s.name}`);
}
console.log(`\n${hits.length} of ${SIGNATURES.length} template signatures present`);

if (hits.length) process.exit(1);
