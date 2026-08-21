import { ImageResponse } from "next/og";
import { loadContent } from "@/lib/content";
import evals from "@/content/evals.json";

export const runtime = "nodejs";

/**
 * Share card, generated from content/facts.md, optionally carrying a question.
 *
 * Two things were wrong with the static card this replaces. The type was set at
 * 24 and 22 pixels inside a 1200x630 canvas, which survives a full-size preview
 * and dissolves in the 200-pixel-wide thumbnail a chat client actually renders.
 * And a link shared from the agent carries `?q=`, so the most interesting thing
 * about that link -- the question someone thought was worth asking -- was thrown
 * away at exactly the moment it would have earned the click.
 *
 * Colours are written literally because this renders in Satori, which has no
 * access to the stylesheet and does not resolve custom properties. They match
 * the tokens in globals.css.
 */
export const size = { width: 1200, height: 630 };

export async function GET(request: Request) {
  const { profile } = loadContent();
  const raw = new URL(request.url).searchParams.get("q");
  // Bounded before it is drawn. An unbounded string here is a stranger choosing
  // how much text renders on an image served from his domain.
  const question = raw ? raw.slice(0, 120).trim() : null;

  /**
   * Cached hard, because the first request is the one that matters.
   *
   * Rendering a 1200x630 PNG through Satori on a cold serverless function is
   * slow enough to time out, and a crawler that gets a 502 does not come back:
   * it caches the absence, and the link renders bare in the thread it was
   * shared into. The card for a given question never changes, so nothing is
   * lost by letting the CDN answer every request after the first.
   */
  const headers = {
    "cache-control": "public, max-age=31536000, s-maxage=31536000, immutable",
  };

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
          padding: "64px 76px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32 }}>
          <span style={{ letterSpacing: 4 }}>{profile.name.toUpperCase()}</span>
          <span style={{ color: "#7a7269" }}>{profile.location}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {question ? (
            <>
              <div style={{ fontSize: 34, color: "#7a7269" }}>Someone asked his site</div>
              <div style={{ fontSize: 56, lineHeight: 1.15, maxWidth: 1000 }}>
                {question.endsWith("?") ? question : `${question}?`}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 62, lineHeight: 1.12, maxWidth: 980 }}>{profile.tagline}</div>
          )}

          {/* Separators are drawn rather than typed: Satori falls back to tofu
              for glyphs its bundled font lacks, and an arrow is exactly the kind
              of character that goes missing on a card seen only by strangers. */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 32 }}>
            <span style={{ color: "#7a7269" }}>route</span>
            <div style={{ width: 30, height: 3, background: "#c4441f" }} />
            <span style={{ color: "#7a7269" }}>retrieve</span>
            <div style={{ width: 30, height: 3, background: "#c4441f" }} />
            <span style={{ color: "#7a7269" }}>answer</span>
          </div>
        </div>

        {/* Two items, not three. A thumbnail has room for one strong claim and
            the address it lives at, and the third row was what pushed the type
            down to a size that stopped reading. */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32 }}>
          <span style={{ maxWidth: 780 }}>
            {question
              ? `${evals.passed}/${evals.cases} eval assertions pass, answered live`
              : profile.proof}
          </span>
          <span style={{ color: "#7a7269" }}>{profile.site.replace("https://", "")}</span>
        </div>
      </div>
    ),
    { ...size, headers },
  );
}
