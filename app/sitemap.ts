import type { MetadataRoute } from "next";
import { loadContent } from "@/lib/content";

/**
 * One page and two machine-readable companions.
 *
 * A sitemap on a single-page site looks like ceremony, and it would be if it
 * only listed the page. What it actually does here is declare `lastModified`
 * from the same `lastVerified` stamp the footer prints, so a crawler and a
 * reader are told the same date by the same source.
 *
 * Recency is a real screening signal rather than a vanity one: 2026 guidance
 * treats work more than two years old as evidence of inexperience rather than
 * range. This is the only place a machine can read that date without parsing
 * prose.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const { profile } = loadContent();
  // Falls back to the build date rather than emitting an invalid stamp if the
  // frontmatter is ever missing the field.
  const lastModified = profile.lastVerified ? new Date(profile.lastVerified) : new Date();

  return [
    {
      url: profile.site,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      // Listed so the structured copy is discoverable rather than a file you
      // have to already know the name of.
      url: `${profile.site}/llms.txt`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
