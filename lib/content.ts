import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const CONTENT_DIR = join(process.cwd(), "content");

export type Metric = { value: string; label: string };

/**
 * A public thing a reader can open, with the state it is actually in upstream.
 *
 * Kept in the corpus beside the prose rather than in a component, for the same
 * reason the metrics are: a URL written into a component is a URL the link
 * checker never sees, and an artifact section whose links have rotted is worse
 * than one that never claimed them.
 */
export type Artifact = { kind: string; state: string; label: string; url: string };

export type Section = {
  /** The `##` heading, verbatim. Doubles as the chunk id for retrieval. */
  title: string;
  body: string;
  /** `facts` for the resume corpus, or the note filename for authored depth. */
  source: string;
  /** Quantified outcomes, lifted out of the prose so they survive a scan. */
  metrics: Metric[];
  /** Technologies, lifted out for the same reason: a reader scans for these. */
  stack: string[];
  /** Openable proof, rendered as its own row rather than buried in a sentence. */
  artifacts: Artifact[];
  /** "Role: ... " line. Rendered as the section heading, so it is kept out of the
   *  prose to avoid printing it twice, and folded back into the retrieval text. */
  role: string;
  /** The Role line, split. Components rendered these as string literals until
   *  2026-08-20, which is exactly the duplication hard rule 1 exists to stop:
   *  editing a date in the corpus left the heading showing the old one. */
  roleParts: { title: string; dates: string; location: string };
};

export type Profile = Record<string, string>;

/**
 * Frontmatter is a flat key/value block, so a YAML parser would be a dependency
 * for one regex. Values may be quoted to protect a leading `+` or `#`.
 */
function parseFrontmatter(raw: string): { profile: Profile; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return { profile: {}, body: raw };

  const profile: Profile = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) profile[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return { profile, body: raw.slice(match[0].length) };
}

/**
 * Split on `##` headings. Header-aware chunking beats fixed-size windows here
 * because the corpus is authored prose with meaningful headings: a chunk ends up
 * being one coherent topic rather than an arbitrary 1000 characters that can cut
 * a sentence, or worse, separate a claim from the number that supports it.
 */
/**
 * "AI Engineer, Graduate Researcher. May 2026 to present. Boston, MA."
 * becomes title, dates and location.
 *
 * Split on sentence boundaries rather than commas, because both the title and
 * the location contain commas and a comma split puts "Graduate Researcher" in
 * the date field. The middle clause is whichever piece carries a year; anything
 * after it is location. A Role line that does not match simply yields empty
 * strings, so a malformed corpus degrades to a missing date rather than a
 * wrong one.
 */
function splitRole(role: string) {
  const empty = { title: "", dates: "", location: "" };
  if (!role) return empty;

  const parts = role
    .split(".")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return empty;

  const dateAt = parts.findIndex((p) => /\b(19|20)\d{2}\b|present/i.test(p));
  if (dateAt < 0) return { title: parts[0], dates: "", location: parts.slice(1).join(", ") };

  return {
    title: parts.slice(0, dateAt).join(". "),
    dates: parts[dateAt],
    location: parts.slice(dateAt + 1).join(", "),
  };
}

function splitSections(body: string, source: string): Section[] {
  return body
    .split(/^## /m)
    .slice(1)
    .map((block) => {
      const nl = block.indexOf("\n");
      const rest = block.slice(nl + 1);

      // `@metric value | label` lines are pulled out of the body. Keeping them
      // in the corpus rather than in a component means the page and the agent
      // read the same numbers, which is the only way they cannot disagree.
      const metrics: Metric[] = [];
      const artifacts: Artifact[] = [];
      let stack: string[] = [];
      let role = "";

      // Line-oriented directives are pulled out before the prose is assembled.
      // Stack and Role wrap in the source, so a continuation line is any line
      // that follows without a blank line between; matching only the first would
      // truncate the list and leave the remainder stranded as a paragraph.
      const kept: string[] = [];
      const lines = rest.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const metric = line.match(/^@metric\s+(.+?)\s*\|\s*(.+)$/);
        if (metric) {
          metrics.push({ value: metric[1].trim(), label: metric[2].trim() });
          continue;
        }

        // `@artifact kind | state | label | url`. State is written out rather
        // than inferred, because "merged" and "closed" look identical to a
        // parser and mean opposite things to a reader.
        const artifact = line.match(/^@artifact\s+(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(\S+)$/);
        if (artifact) {
          artifacts.push({
            kind: artifact[1].trim(),
            state: artifact[2].trim(),
            label: artifact[3].trim(),
            url: artifact[4].trim(),
          });
          continue;
        }

        const directive = line.match(/^(Stack|Role):\s*(.+)$/);
        if (directive) {
          let value = directive[2];
          while (i + 1 < lines.length && lines[i + 1].trim() && !/^(@|\w+:)/.test(lines[i + 1])) {
            value += " " + lines[++i].trim();
          }
          if (directive[1] === "Role") {
            role = value.trim();
          } else {
            stack = value
              .replace(/\.$/, "")
              .split(/,\s*(?![^(]*\))/)
              .map((t) => t.trim())
              .filter(Boolean);
          }
          continue;
        }

        kept.push(line);
      }

      const body = kept.join("\n");

      return {
        title: block.slice(0, nl).trim(),
        body: body.trim(),
        source,
        metrics,
        stack,
        artifacts,
        role,
        roleParts: splitRole(role),
      };
    })
    .filter((s) => s.body.length > 0);
}

let cache: { profile: Profile; sections: Section[] } | null = null;

export function loadContent() {
  if (cache) return cache;

  const raw = readFileSync(join(CONTENT_DIR, "facts.md"), "utf8");
  const { profile, body } = parseFrontmatter(raw);
  const sections = splitSections(body, "facts");

  // Authored engineering notes. Optional: the site is complete without them,
  // they just give the agent depth on "how do you think" questions that a
  // resume structurally cannot answer.
  const notesDir = join(CONTENT_DIR, "notes");
  if (existsSync(notesDir)) {
    for (const file of readdirSync(notesDir).filter((f) => f.endsWith(".md"))) {
      const note = readFileSync(join(notesDir, file), "utf8");
      const parsed = parseFrontmatter(note);
      sections.push(...splitSections(parsed.body, file.replace(/\.md$/, "")));
    }
  }

  cache = { profile, sections };
  return cache;
}

export function section(title: string): Section {
  const found = loadContent().sections.find((s) => s.title === title);
  if (!found) {
    // Loud on purpose. A missing section means the page and the corpus have
    // drifted, which is the failure that put contradictory facts on the last site.
    throw new Error(`content: no section titled "${title}" in facts.md`);
  }
  return found;
}

export type Certification = {
  id: string;
  name: string;
  short?: string;
  issuer: string;
  year: number;
  url: string | null;
  kind: string;
  featured: boolean;
  why?: string;
  components?: { name: string; url: string | null }[];
};

/**
 * Progress through a multi-course program, derived from which components carry a
 * verification link rather than from a separate counter. A hand-kept number and
 * a list of links are two sources for one fact, and they drift the first time
 * only one of them gets updated.
 */
export function progress(c: Certification) {
  if (!c.components) return null;
  return { earned: c.components.filter((x) => x.url).length, total: c.components.length };
}

export function loadCertifications(): Certification[] {
  const raw = readFileSync(join(CONTENT_DIR, "certifications.json"), "utf8");
  return JSON.parse(raw).certifications;
}

/** Every external URL the site renders, for the link checker. */
export function allLinks(): string[] {
  const { profile, sections } = loadContent();
  const found = new Set<string>();

  for (const value of Object.values(profile)) {
    if (value.startsWith("http")) found.add(value);
  }
  for (const s of sections) {
    for (const m of s.body.matchAll(/https?:\/\/[^\s)<>"']+/g)) {
      found.add(m[0].replace(/[.,]$/, ""));
    }
    // Artifact URLs are stripped out of the body by the parser, so scanning the
    // prose alone would quietly stop checking the strongest links on the site.
    for (const a of s.artifacts) found.add(a.url);
  }
  for (const c of loadCertifications()) {
    if (c.url) found.add(c.url);
    for (const comp of c.components ?? []) if (comp.url) found.add(comp.url);
  }
  return [...found];
}
