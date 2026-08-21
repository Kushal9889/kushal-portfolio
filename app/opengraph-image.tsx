import { ImageResponse } from "next/og";
import { loadContent, loadCertifications } from "@/lib/content";

export const alt = "Kushal Gaddamwar, Agentic AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Share card, generated from content/facts.md.
 *
 * 1200x630 covers roughly ninety percent of share surfaces, and generating it
 * from the corpus rather than exporting a static image means it cannot end up
 * advertising a title he no longer holds.
 *
 * Colours are written literally here because this renders in Satori, which has
 * no access to the stylesheet and does not resolve custom properties. They match
 * the tokens in globals.css.
 */
export default async function Image() {
  const { profile } = loadContent();
  const featured = loadCertifications().find((c) => c.featured);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f5ef",
          color: "#2b2621",
          padding: "72px 80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24 }}>
          <span style={{ letterSpacing: 4 }}>{profile.name.toUpperCase()}</span>
          <span style={{ color: "#7a7269" }}>{profile.location}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, lineHeight: 1.1, maxWidth: 900 }}>{profile.tagline}</div>
          {/* Separators are drawn rather than typed: Satori falls back to tofu
              for glyphs its bundled font lacks, and an arrow is exactly the kind
              of character that goes missing on a card seen only by strangers. */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 26 }}>
            <span style={{ color: "#7a7269" }}>route</span>
            <div style={{ width: 26, height: 2, background: "#c4441f" }} />
            <span style={{ color: "#7a7269" }}>retrieve</span>
            <div style={{ width: 26, height: 2, background: "#c4441f" }} />
            <span style={{ color: "#7a7269" }}>answer</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}>
          {/* The strongest fact leads. A credential says a body vouched for
              him; the merged fix says a maintainer acted on his work. */}
          <span>{profile.proof ?? (featured ? `${featured.issuer} Certified · ${featured.short}` : profile.role)}</span>
          <span style={{ color: "#7a7269" }}>{profile.site.replace("https://", "")}</span>
        </div>
      </div>
    ),
    size,
  );
}
