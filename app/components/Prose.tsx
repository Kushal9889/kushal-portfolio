import { Fragment } from "react";

/**
 * Inline emphasis for the corpus.
 *
 * Three marks, each with one job, so weight stays meaningful:
 *   **bold**        a claim worth stopping on
 *   [text](url)     external proof a reader can open and check
 *   bare url        the same, when the address itself is the useful part
 *
 * A full markdown renderer would ship a parser for syntax this content does not
 * use. If the notes ever need lists, tables or headings, that is the point to
 * add one.
 */
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)<>"']+)/g;
const BOLD = /^\*\*([^*]+)\*\*$/;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;
const BARE = /^https?:\/\//;

function trimUrl(url: string) {
  return url.replace(BARE, "").replace(/\/$/, "");
}

export default function Prose({ body, className }: { body: string; className?: string }) {
  return (
    <div className={className ? `prose ${className}` : "prose"}>
      {body.split(/\n{2,}/).map((para, i) => (
        <p key={i}>
          {para.split(TOKEN).map((part, j) => {
            const bold = part.match(BOLD);
            if (bold) return <strong key={j}>{bold[1]}</strong>;

            const link = part.match(LINK);
            if (link)
              return (
                <a key={j} href={link[2]} target="_blank" rel="noreferrer">
                  {link[1]}
                </a>
              );

            if (BARE.test(part))
              return (
                <a key={j} href={part} target="_blank" rel="noreferrer">
                  {trimUrl(part)}
                </a>
              );

            return <Fragment key={j}>{part}</Fragment>;
          })}
        </p>
      ))}
    </div>
  );
}
