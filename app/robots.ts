import type { MetadataRoute } from "next";
import { loadContent } from "@/lib/content";

/**
 * robots.txt, written for the reader that arrives first.
 *
 * Roughly 90% of employers now run an AI tool over a candidate before a person
 * opens anything, and a large share of recruiters screen with one before they
 * open the site at all. That reader has no eyes: it does not see the type scale
 * or the retrieval figure. It sees whatever text it can find, and it gives up
 * quickly.
 *
 * So nothing is disallowed, the sitemap is named, and `/llms.txt` is pointed at
 * explicitly. That file is the same facts already structured, which means the
 * machine-generated version of him is the accurate one rather than a guess
 * assembled from layout.
 *
 * The `/api/` disallow is not defensive. Those routes call a paid model on a
 * free tier, and a crawler walking them would spend his budget answering
 * questions nobody asked.
 */
export default function robots(): MetadataRoute.Robots {
  const { profile } = loadContent();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${profile.site}/sitemap.xml`,
    host: profile.site,
  };
}
