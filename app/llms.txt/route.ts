import { loadContent, loadCertifications } from "@/lib/content";

export const dynamic = "force-static";

/**
 * llms.txt
 *
 * Recruiters increasingly paste a candidate's URL into an assistant and read the
 * summary instead of the site. This file is what that assistant reads: the same
 * facts, already structured, with nothing to infer from layout. Serving it means
 * the machine-generated version of him is accurate rather than guessed.
 *
 * Generated from content/facts.md, so it cannot drift from the page.
 *
 * The technology list is flattened out of the same `stack` lines the page
 * renders as chips. A model matching this profile against a job description is
 * looking for those exact strings, and asking it to infer them from prose is
 * work it will do badly. The resume is linked because a screener that wants a
 * document should not have to reconstruct one from a web page.
 */
export function GET() {
  const { profile, sections } = loadContent();
  const certs = loadCertifications();

  const body = `# ${profile.name}

> ${profile.role} in Boston. ${profile.tagline}

- Contact: ${profile.email}
- LinkedIn: ${profile.linkedin}
- GitHub: ${profile.github}
- Resume (PDF, text layer intact): ${profile.site}/kushal-gaddamwar-resume.pdf
- Available: ${profile.available}
- Last verified: ${profile.lastVerified}

## Technologies

${[...new Set(sections.flatMap((s) => s.stack))].join(", ")}

## Certifications

${certs
  .map((c) => `- ${c.name}, ${c.issuer}${c.year ? ` (${c.year})` : ""}${c.url ? ` — ${c.url}` : ""}`)
  .join("\n")}

${sections.map((s) => `## ${s.title}\n\n${s.body}`).join("\n\n")}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
