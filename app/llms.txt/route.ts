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
 */
export function GET() {
  const { profile, sections } = loadContent();
  const certs = loadCertifications();

  const body = `# ${profile.name}

> ${profile.role} in Boston. ${profile.tagline}

- Contact: ${profile.email}
- LinkedIn: ${profile.linkedin}
- GitHub: ${profile.github}
- Available: ${profile.available}
- Last verified: ${profile.lastVerified}

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
