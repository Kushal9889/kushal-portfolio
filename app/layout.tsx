import type { Metadata } from "next";
import { Martian_Mono, Newsreader } from "next/font/google";
import { loadContent } from "@/lib/content";
import "./globals.css";

// Self-hosted by next/font at build time. The previous site loaded two of its
// three families through a render-blocking <link> to fonts.googleapis.com, which
// put a network round trip in front of the headline.
const mono = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["300", "400", "600"],
});

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

const { profile } = loadContent();

export const metadata: Metadata = {
  metadataBase: new URL(profile.site),
  title: `${profile.name} — ${profile.role}`,
  description: profile.tagline,
  authors: [{ name: profile.name, url: profile.site }],
  openGraph: {
    type: "profile",
    title: `${profile.name} — ${profile.role}`,
    description: profile.tagline,
    url: profile.site,
    siteName: profile.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.role}`,
    description: profile.tagline,
  },
  alternates: { canonical: profile.site },
  robots: { index: true, follow: true },
};

/**
 * Person + WebSite in one @graph. Search engines and assistants read this to
 * resolve "who is Kushal Gaddamwar" as an entity rather than guessing from prose,
 * which matters because recruiters increasingly ask a model about a candidate
 * before opening the site.
 */
function structuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${profile.site}/#person`,
        name: profile.name,
        jobTitle: profile.role,
        email: `mailto:${profile.email}`,
        url: profile.site,
        address: { "@type": "PostalAddress", addressLocality: "Boston", addressRegion: "MA" },
        sameAs: [profile.linkedin, profile.github],
        alumniOf: [
          { "@type": "CollegeOrUniversity", name: "Boston University" },
          { "@type": "CollegeOrUniversity", name: "IIIT Design and Manufacturing Jabalpur" },
        ],
        worksFor: {
          "@type": "Organization",
          name: "Boston University, Questrom Computational Lab",
        },
        knowsAbout: [
          "Agentic AI",
          "LangGraph",
          "Retrieval-Augmented Generation",
          "Context Engineering",
          "LLM Evaluation",
          "Multi-Agent Orchestration",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${profile.site}/#website`,
        url: profile.site,
        name: profile.name,
        publisher: { "@id": `${profile.site}/#person` },
      },
    ],
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${serif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
