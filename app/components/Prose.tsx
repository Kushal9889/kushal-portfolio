import { Fragment } from "react";

/**
 * Inline emphasis for the corpus.
 *
 * Four marks, each with one job, so weight stays meaningful:
 *   **bold**        a claim worth stopping on
 *   `code`          an identifier, exactly as it is spelled in the source
 *   [text](url)     external proof a reader can open and check
 *   bare url        the same, when the address itself is the useful part
 *
 * A full markdown renderer would ship a parser for syntax this content does not
 * use. If the notes ever need lists, tables or headings, that is the point to
 * add one.
 *
 * The first sentence of every paragraph is set one step larger and at full ink,
 * and the rest of the paragraph steps back to --ink-soft. Reading only the leads
 * gives a complete pass over the section, which is what someone spending seven
 * seconds actually does. Nothing is hidden and no wording changes: the same
 * paragraph is simply legible at two speeds.
 */
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)<>"']+)/;
const BOLD = /^\*\*([^*]+)\*\*$/;
const CODE = /^`([^`]+)`$/;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;
const BARE = /^https?:\/\//;

function trimUrl(url: string) {
  return url.replace(BARE, "").replace(/\/$/, "");
}

/**
 * Where the opening sentence ends.
 *
 * The boundary is a full stop followed by a space, which is safe against the
 * decimals and version numbers in this corpus because those have no space after
 * the point. It has to ignore any boundary that falls inside a mark, though:
 * the strongest line in the open-source section is a whole sentence wrapped in
 * bold, and cutting at the stop inside it would split `**` from its closing pair
 * and print the asterisks.
 */
function leadEnd(para: string) {
  const marks: Array<[number, number]> = [];
  for (const m of para.matchAll(new RegExp(TOKEN, "g"))) {
    marks.push([m.index, m.index + m[0].length]);
  }

  for (const m of para.matchAll(/[.!?]\s+/g)) {
    const stop = m.index;
    const enclosing = marks.find(([a, b]) => stop > a && stop < b);
    // A mark that closes the sentence is part of the lead, so the lead runs to
    // the end of the mark rather than stopping inside it.
    if (enclosing) {
      if (enclosing[1] >= para.length - 1) return para.length;
      if (stop === enclosing[1] - 3) return enclosing[1];
      continue;
    }
    return stop + 1;
  }
  return para.length;
}

function render(text: string, keyPrefix: string) {
  return text.split(new RegExp(TOKEN, "g")).map((part, j) => {
    const key = `${keyPrefix}-${j}`;

    const bold = part.match(BOLD);
    if (bold) return <strong key={key}>{bold[1]}</strong>;

    const code = part.match(CODE);
    if (code) return <code key={key}>{code[1]}</code>;

    const link = part.match(LINK);
    if (link)
      return (
        <a key={key} href={link[2]} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      );

    if (BARE.test(part))
      return (
        <a key={key} href={part} target="_blank" rel="noreferrer">
          {trimUrl(part)}
        </a>
      );

    return <Fragment key={key}>{part}</Fragment>;
  });
}

/**
 * Long sections open on request; short ones never close.
 *
 * The page ran to fifteen screens, and a paragraph capped at its reading measure
 * does not get shorter when the window gets wider, so layout alone could not fix
 * it. Below the threshold a section is left whole, because a control that saves
 * one line costs more attention than the line does.
 *
 * The detail is always in the markup. `hidden` is not used and nothing is
 * fetched on expand: a crawler, a printer and a reader with scripting off all
 * get the complete text, and `<details>` carries the open and closed state to
 * assistive software without any of it being reimplemented here.
 */
const COLLAPSE_OVER_WORDS = 120;

export default function Prose({ body, className }: { body: string; className?: string }) {
  const paras = body.split(/\n{2,}/);

  const render_ = (para: string, i: number) => {
    const cut = leadEnd(para);
    const lead = para.slice(0, cut);
    const rest = para.slice(cut);
    return (
      <p key={i}>
        <span className="lead">{render(lead, `l${i}`)}</span>
        {rest && render(rest, `r${i}`)}
      </p>
    );
  };

  const words = body.split(/\s+/).length;
  const root = className ? `prose ${className}` : "prose";

  if (words <= COLLAPSE_OVER_WORDS || paras.length < 2) {
    return <div className={root}>{paras.map(render_)}</div>;
  }

  // The opening paragraph carries the argument on its own; the rest is the
  // evidence for it. That is the seam, so that is where it folds.
  const [first, ...others] = paras;

  return (
    <div className={root}>
      {render_(first, 0)}
      <details className="more">
        <summary>
          <span className="more-open">Read the detail</span>
          <span className="more-close">Show less</span>
        </summary>
        {others.map((p, i) => render_(p, i + 1))}
      </details>
    </div>
  );
}
