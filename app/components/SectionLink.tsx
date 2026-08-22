"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import styles from "./SectionLink.module.css";

/**
 * The section number, as something a reader can send.
 *
 * It was decoration, then it became an anchor, and an anchor still asks the
 * reader to know that right-clicking a link copies its address. The commonest
 * reason to want one of these is to put it in a message -- "look at 02" -- so
 * the click copies the absolute URL and says it did.
 *
 * Navigating still works: the href is real and the fragment is set, so a
 * middle-click, a keyboard activation, or a blocked clipboard all behave the
 * way a link is supposed to.
 */
export default function SectionLink({ id, index, title }: { id: string; index: string; title: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <a
      className={styles.index}
      href={`#${id}`}
      aria-label={`Copy a link to section ${index}, ${title}`}
      data-copied={copied || undefined}
      onClick={(e) => {
        // Only intercept a plain click. A modifier means the reader wants the
        // browser's behaviour, not ours.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        navigator.clipboard?.writeText(url).then(
          () => {
            setCopied(true);
            track("contact", `section-link-${id}`);
            setTimeout(() => setCopied(false), 2000);
          },
          () => {
            // Clipboard refused. The anchor still moved the page.
          },
        );
      }}
    >
      {index}
      <span className={styles.said} aria-hidden="true">
        {copied ? "link copied" : "copy link"}
      </span>
    </a>
  );
}
