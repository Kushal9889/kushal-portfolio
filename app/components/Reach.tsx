"use client";

import { useState } from "react";
import { mailtoLink, linkedinNote, type ReachContext } from "@/lib/reach";
import { track } from "@/lib/analytics";
import { GitHubMark, LinkedInMark, MailMark } from "./Mark";
import styles from "./Reach.module.css";

/**
 * The contact block, rebuilt around the moment someone decides to write.
 *
 * The links here used to be a bare `mailto:`, a profile URL and a repo URL.
 * Each of those is a correct address and none of them is a message. The reader
 * arrives at a blank compose window holding the whole cost of starting, at
 * exactly the point they had already decided to act, and that cost is invisible
 * to us because an unsent email leaves no trace.
 *
 * Mail now opens written. LinkedIn cannot accept a prefilled note through a URL
 * (the parameter was removed and a fabricated one lands on a dead screen), so
 * the note goes to the clipboard as the profile opens and the page says so.
 * The resume is a real file rather than a promise that one exists.
 */
export default function Reach({
  email,
  linkedin,
  github,
  repo,
  site,
  resumeHref,
  context = "general",
}: {
  email: string;
  linkedin: string;
  github: string;
  /** The work sample itself. The profile is a list of repositories; this is the
   *  one the reader was just looking at. */
  repo: string;
  site: string;
  resumeHref: string;
  context?: ReachContext;
}) {
  const [copied, setCopied] = useState(false);

  async function openLinkedIn() {
    track("contact", "linkedin");
    // Copy first, then open. Reversing these loses the clipboard permission in
    // Safari, because the write no longer counts as part of the user gesture.
    try {
      await navigator.clipboard.writeText(linkedinNote(context));
      setCopied(true);
      setTimeout(() => setCopied(false), 6000);
    } catch {
      // Clipboard blocked. The profile still opens; only the shortcut is lost.
    }
    window.open(linkedin, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={styles.wrap}>
      <ul className={styles.links}>
        <li>
          {/* Opens a composed draft rather than an empty one. Subject carries the
              role, body names what they were reading, and it is short enough to
              send unedited or replace in one keystroke. */}
          <a
            className={styles.primary}
            href={mailtoLink(email, site, context)}
            onClick={() => track("contact", "email")}
            data-pull
          >
            <MailMark />
            <span>
              <strong>Email him</strong>
              <span className={styles.sub}>opens a written draft, not a blank one</span>
            </span>
          </a>
        </li>

        <li>
          <button type="button" className={styles.item} onClick={openLinkedIn} data-pull>
            <LinkedInMark />
            <span>
              <strong>LinkedIn</strong>
              <span className={styles.sub}>
                {copied ? "note copied, paste it into the message box" : "copies an opening note"}
              </span>
            </span>
          </button>
        </li>

        <li>
          <a
            className={styles.item}
            href={resumeHref}
            download
            onClick={() => track("contact", "resume")}
            data-pull
          >
            <span aria-hidden="true" className={styles.glyph}>
              PDF
            </span>
            <span>
              <strong>Resume</strong>
              <span className={styles.sub}>one page, text layer intact for your ATS</span>
            </span>
          </a>
        </li>

        <li>
          <a
            className={styles.item}
            href={repo}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("contact", "github")}
            data-pull
          >
            <GitHubMark />
            <span>
              <strong>Source for this page</strong>
              <span className={styles.sub}>{repo.replace("https://github.com/", "")}</span>
            </span>
          </a>
        </li>
      </ul>

      {/* The plain address stays reachable. Someone forwarding this to a
          colleague needs a string they can paste, not a link they must click. */}
      <p className={styles.plain}>
        Or copy it: <span className={styles.address}>{email}</span>
      </p>
    </div>
  );
}
