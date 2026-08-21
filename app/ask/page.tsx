import type { Metadata } from "next";
import Page from "../page";

/**
 * The same page, at the URL a shared answer points to.
 *
 * A link out of the agent carries `?q=`, and that question is the most
 * interesting thing about the link: it is what one person thought was worth
 * asking about him. Rendering it into the share card means a message dropped in
 * a thread shows the question rather than the same tagline every stranger sees.
 *
 * Reading a search param in `generateMetadata` opts the whole route out of
 * static rendering, which is why this is a second route rather than a change to
 * `/`. The home page stays prerendered on the CDN for everyone, and only the
 * shared links -- a small and self-selecting slice of traffic -- pay for a
 * server render. The component is imported, not copied, so the two URLs cannot
 * drift apart.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const q = (await searchParams).q;
  // Bounded before it reaches an image served from his domain.
  const question = typeof q === "string" ? q.slice(0, 120) : null;
  const image = question ? `/og?q=${encodeURIComponent(question)}` : "/og";

  return {
    // Canonical points home. This route exists to carry a card, not to become a
    // second copy of the page in an index.
    alternates: { canonical: "/" },
    openGraph: {
      images: [{ url: image, width: 1200, height: 630 }],
      ...(question ? { title: question } : {}),
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default Page;
