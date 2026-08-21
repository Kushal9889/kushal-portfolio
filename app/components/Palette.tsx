"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Palette.module.css";
import { track } from "@/lib/analytics";

type Command = { label: string; hint: string; run: () => void };

/**
 * Command palette on Cmd/Ctrl+K.
 *
 * Six sections with no navigation is a scroll trap, and a fixed nav bar would
 * spend permanent screen space on something used once. This costs nothing until
 * summoned, and it is the interaction an engineer reaching for Cmd+K expects to
 * find. The jump links below the fold cover everyone who does not.
 */
export default function Palette({
  email,
  github,
  repo,
}: {
  email: string;
  github: string;
  repo: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previous = useRef<HTMLElement | null>(null);

  const go = (id: string) => () => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const commands: Command[] = [
    // The agent lives in the hero, not in a section of its own. This pointed at
    // an anchor that was removed when it moved.
    {
      label: "Ask the agent",
      hint: "top of page",
      run: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => document.querySelector<HTMLInputElement>("#ask")?.focus(), 400);
      },
    },
    { label: "A bug in LangChain", hint: "section", run: go("opensource") },
    { label: "Work", hint: "section", run: go("work") },
    { label: "BU Life AI", hint: "section", run: go("projects") },
    { label: "Proof and certifications", hint: "section", run: go("proof") },
    { label: "Get in touch", hint: "section", run: go("contact") },
    {
      label: "Copy email address",
      hint: email,
      run: () => {
        navigator.clipboard?.writeText(email);
        track("contact", "palette-email");
      },
    },
    {
      // Strips the page to headings, metrics and links for a reader who has
      // seven seconds rather than two minutes. Toggled rather than a separate
      // route so nothing has to be maintained twice.
      label: "Recruiter mode",
      hint: "condense the page",
      run: () => document.documentElement.classList.toggle("condensed"),
    },
    { label: "Print or save as PDF", hint: "uses the print stylesheet", run: () => window.print() },
    { label: "Open the source for this page", hint: "repo", run: () => window.open(repo, "_blank") },
    { label: "Open GitHub profile", hint: "external", run: () => window.open(github, "_blank") },
    // The prop feeding "Open GitHub" used to be called `resume`, from a time
    // when no resume existed. There is one now, so it gets its own entry.
    {
      label: "Download resume",
      hint: "pdf",
      run: () => window.open("/kushal-gaddamwar-resume.pdf", "_blank"),
    },
  ];

  const matches = commands.filter((c) =>
    c.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus moves into the dialog on open and returns to wherever it came from on
  // close, so a keyboard user is never dropped at the top of the document.
  useEffect(() => {
    if (open) {
      previous.current = document.activeElement as HTMLElement;
      setQuery("");
      setCursor(0);
      inputRef.current?.focus();
    } else {
      previous.current?.focus();
    }

    // Published on the root so the printed keys next to the agent depress when
    // the real shortcut is used. The hint then demonstrates itself rather than
    // describing something happening elsewhere on the page.
    document.documentElement.dataset.palette = open ? "open" : "closed";
  }, [open]);

  if (!open) return null;

  function choose(index: number) {
    matches[index]?.run();
    setOpen(false);
  }

  return (
    <div
      className={styles.scrim}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Command palette">
        <input
          ref={inputRef}
          className={styles.input}
          value={query}
          placeholder="Jump to"
          aria-label="Jump to"
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setCursor((c) => Math.min(c + 1, matches.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setCursor((c) => Math.max(c - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(cursor);
            }
          }}
        />
        <ul className={styles.list}>
          {matches.map((c, i) => (
            <li key={c.label}>
              <button
                className={i === cursor ? `${styles.item} ${styles.on}` : styles.item}
                onMouseEnter={() => setCursor(i)}
                onClick={() => choose(i)}
              >
                <span>{c.label}</span>
                <span className={styles.hint}>{c.hint}</span>
              </button>
            </li>
          ))}
          {matches.length === 0 && <li className={styles.empty}>Nothing matches that.</li>}
        </ul>
      </div>
    </div>
  );
}
