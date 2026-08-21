import { loadContent, loadCertifications } from "../lib/content";

/**
 * Guards the single source of truth.
 *
 * The previous site kept every fact twice, once in the retrieval corpus and once
 * inline in a component, and the two had already drifted: one claimed a
 * technology the other did not, and the résumé disagreed with both. This checks
 * that the page can only render what the corpus contains.
 */

const REQUIRED_SECTIONS = [
  "Who he is",
  "What he is good at",
  "Boston University, Questrom Computational Lab",
  "IMG Systems",
  "Growaza",
  "BU Life AI",
  "Open source, LangChain deepagents",
  "Certifications",
  "Education",
  "Publications",
  "Achievements",
  "Availability",
  "Work authorisation",
  "This site",
];

const { profile, sections } = loadContent();
const titles = new Set(sections.map((s) => s.title));
const problems: string[] = [];

for (const title of REQUIRED_SECTIONS) {
  if (!titles.has(title)) problems.push(`missing section: "${title}"`);
}

for (const key of ["name", "role", "tagline", "email", "linkedin", "github", "site"]) {
  if (!profile[key]) problems.push(`missing frontmatter: ${key}`);
}

const featured = loadCertifications().filter((c) => c.featured);
if (featured.length !== 1) {
  problems.push(`expected exactly one featured certification, found ${featured.length}`);
}
if (featured[0] && !featured[0].url) {
  problems.push("featured certification has no verification URL");
}

// Claims are only worth making if a reader can check them, so a standalone
// credential without a link is treated as incomplete rather than acceptable.
// A program is exempt: its components carry the links, and an unlinked component
// is a course not yet finished rather than an unverifiable claim.
for (const c of loadCertifications()) {
  if (c.kind !== "program" && !c.url) problems.push(`certification "${c.name}" has no URL`);
  if (c.kind === "program" && !c.components?.length) {
    problems.push(`program "${c.name}" lists no components`);
  }
}

// A stack entry is the name of a technology. When a sentence leaks into the
// list, the row renders prose between rules and reads as broken; this caught
// exactly that after the extraction was added.
for (const s2 of sections) {
  for (const tech of s2.stack) {
    if (tech.length > 24 || /[.]/.test(tech.replace(/^(Node|Next)\.js$/, ""))) {
      problems.push(`"${s2.title}" stack entry looks like prose: "${tech}"`);
    }
  }
}

// The em-dash rate is the most reliable single tell of machine-written prose.
// Human baseline sits near 3 per thousand words; generated copy runs three times
// that. This keeps the corpus on the human side of the line.
const prose = sections.map((s) => s.body).join(" ");
const words = prose.split(/\s+/).length;
const emDashes = (prose.match(/—/g) ?? []).length;
const rate = (emDashes / words) * 1000;
if (rate > 2) problems.push(`em-dash rate ${rate.toFixed(2)} per 1000 words (limit 2)`);

console.log(`${sections.length} sections, ${words} words, em-dash rate ${rate.toFixed(2)}/1000`);

if (problems.length) {
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
/**
 * Availability decays on a schedule nobody is watching.
 *
 * "Full-time from January 2027" is a strong line until January 2027, and then it
 * quietly becomes evidence that nothing here is maintained. A date is the one
 * kind of claim that can rot without anyone editing the file, so the build fails
 * once it is in the past rather than waiting for a reader to notice.
 */
const availability = profile.available ?? "";
const month = availability.match(
  /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i,
);
if (month) {
  const stated = new Date(`${month[1]} 1, ${month[2]}`);
  if (stated < new Date()) {
    problems.push(
      `availability "${availability}" is in the past; update content/facts.md frontmatter`,
    );
  }
}

if (problems.length) {
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log("facts ok");
