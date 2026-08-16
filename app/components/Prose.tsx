"use client";

import { Fragment, useEffect, useRef } from "react";

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

/**
 * Folds on a phone, open on a desktop.
 *
 * Rendered open, always. A crawler, a printer, a reader with scripting off and
 * anyone on a wide screen gets the complete text with no control in the way,
 * which is also why there is no hydration mismatch to manage: the server and
 * the first client render agree, and the narrow case is applied afterwards.
 *
 * The phone is the case that needs this. Measured at 375px the page ran to 15.4
 * screens against 11.7 on a desktop, because the two-column layout collapses and
 * every horizontal saving disappears. Folding the evidence and leaving the lead
 * sentences is what makes that length skimmable rather than shorter.
 */
function useFoldOnNarrow(ref: React.RefObject<HTMLDetailsElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const narrow = window.matchMedia("(max-width: 62rem)");
    const apply = () => {
      // Never re-close something the reader opened themselves.
      if (el.dataset.touched === "yes") return;
      el.open = !narrow.matches;
    };

    const remember = () => {
      el.dataset.touched = "yes";
    };

    apply();
    narrow.addEventListener("change", apply);
    el.addEventListener("toggle", remember);
    return () => {
      narrow.removeEventListener("change", apply);
      el.removeEventListener("toggle", remember);
    };
  }, [ref]);
}

/**
 * `desktopWorthy` marks a section long enough that the control earns its place
 * on a wide screen too (the 120-word threshold below). Below it, the fold still
 * exists in the markup for narrow screens, but the toggle is hidden above the
 * 62rem breakpoint via `data-desktop-fold`, purely in CSS: no viewport check
 * needed at render time, so there is nothing here for server and client to
 * disagree about.
 */
function Foldable({
  children,
  desktopWorthy,
}: {
  children: React.ReactNode;
  desktopWorthy: boolean;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useFoldOnNarrow(ref);

  return (
    <details className="more" data-desktop-fold={desktopWorthy ? "yes" : "no"} ref={ref} open>
      <summary>
        <span className="more-open">Read the detail</span>
        <span className="more-close">Show less</span>
      </summary>
      {children}
    </details>
  );
}

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

  // A single paragraph has no seam to fold at, on any screen.
  if (paras.length < 2) {
    return <div className={root}>{paras.map(render_)}</div>;
  }

  // The opening paragraph carries the argument on its own; the rest is the
  // evidence for it. That is the seam, so that is where it folds. Every
  // multi-paragraph section folds on a narrow screen, because line width is
  // fixed there regardless of how much room the window has; the 120-word
  // threshold only decides whether the control is worth its keep once there
  // is width to spend elsewhere.
  const [first, ...others] = paras;

  return (
    <div className={root}>
      {render_(first, 0)}
      <Foldable desktopWorthy={words > COLLAPSE_OVER_WORDS}>
        {others.map((p, i) => render_(p, i + 1))}
      </Foldable>
    </div>
  );
}
