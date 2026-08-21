import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadContent, loadCertifications, section } from "../lib/content";
import evals from "../content/evals.json";

/**
 * The GitHub profile README, generated from the corpus.
 *
 * A recruiter who finds him through the deepagents pull request lands on
 * github.com/Kushal9889 before they ever see the site, and that page is
 * currently a list of repositories. Writing a profile README by hand would make
 * it the second place his facts live, which is how the last portfolio ended up
 * contradicting itself; generating it means the two cannot disagree.
 *
 * Emitted to docs/ rather than pushed. It belongs to a different repository
 * (Kushal9889/Kushal9889), and a build step that writes to someone else's repo
 * is a surprise nobody wants in a deploy.
 */
const { profile } = loadContent();
const featured = loadCertifications().find((c) => c.featured);
const openSource = section("Open source, LangChain deepagents");
const papers = section("Publications");

/**
 * The corpus is written in the third person, because the site's agent speaks
 * about him to a recruiter. A profile README is his own page and reads wrong in
 * the third person, so the leading pronoun is dropped rather than the sentence
 * being rewritten -- a rewritten sentence would be a second copy of the fact,
 * which is the failure this whole file exists to avoid.
 */
const firstPerson = (text: string) =>
  text
    .replace(/^He\s+/, "")
    .replace(/\bhe\s+filed\b/g, "I filed")
    .replace(/\bhis\b/g, "my")
    .replace(/^([a-z])/, (c) => c.toUpperCase());

const metric = (title: string, label: string) =>
  section(title).metrics.find((m) => m.label.includes(label))?.value ?? "";

const lines: (string | null)[] = [
  `## ${profile.name}`,
  "",
  `${profile.current}. ${profile.tagline}`,
  "",
  // The strongest claim leads, because it is the only one no other candidate
  // can copy: a maintainer of someone else's SDK acted on his report.
  `**${firstPerson(profile.proof)}**`,
  "",
  ...openSource.artifacts.map((a) => `- ${firstPerson(a.kind)} — [${a.label}](${a.url}) (${a.state})`),
  "",
  "### What I build",
  "",
  profile.focus.split(" · ").map((f) => `\`${f}\``).join(" "),
  "",
  "### Live work sample",
  "",
  `[${profile.site.replace("https://", "")}](${profile.site}) runs a LangGraph agent over my own resume:`,
  "hybrid BM25 and dense retrieval with reciprocal rank fusion, a policy layer that routes",
  "compensation and prompt-override questions away from the model, and per-answer cost accounting.",
  "",
  `- **${evals.passed}/${evals.cases}** eval assertions pass · **${evals.p50}ms** median · **${evals.p95}ms** p95, measured ${evals.measured}`,
  `- Source: [${profile.repo.replace("https://github.com/", "")}](${profile.repo})`,
  "",
  "### Research",
  "",
  `Automated bug detection: **${metric("Publications", "combined")}** combined transformer and GNN accuracy,`,
  `against **${metric("Publications", "transformer alone")}** for the transformer alone.`,
  "",
  ...papers.artifacts.map((a) => `- ${a.kind} — [${a.label}](${a.url})`),
  "",
  "### Elsewhere",
  "",
  `- [Portfolio](${profile.site}) · [LinkedIn](${profile.linkedin}) · ${profile.email}`,
  featured?.url
    ? `- [${featured.issuer} Certified: ${featured.short ?? featured.name}](${featured.url})`
    : null,
  "",
  "---",
  "",
  `<sub>Generated from the corpus at ${profile.repo.replace("https://github.com/", "")} — content/facts.md.`,
  "Edited there, not here, so it cannot drift from the site.</sub>",
  "",
  // Only the optional credential line is dropped. Filtering every empty string
  // here collapsed the blank lines between blocks and markdown ran the whole
  // document together as one paragraph.
].filter((l) => l !== null);

const out = lines.join("\n") + "\n";
writeFileSync(join(process.cwd(), "docs/profile-README.md"), out);

console.log(
  `build-profile-readme: ${out.split("\n").length} lines written to docs/profile-README.md\n` +
    "  Paste into the Kushal9889/Kushal9889 repository to publish it on the profile.",
);
