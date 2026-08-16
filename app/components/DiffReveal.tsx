"use client";

import { useMotion } from "@/lib/motion";
import { GitHubMark } from "./Mark";
import styles from "./DiffReveal.module.css";

/**
 * The signature moment on the page.
 *
 * As the section scrolls, the swallowed error surfaces and the fix lands. It is
 * the one thing here that is genuinely his and cannot be copied: a real defect he
 * found in a production SDK, rendered as the code that changed.
 *
 * Driven entirely by CSS scroll timelines, so it runs on the compositor with no
 * scroll listener and no animation library. Safari does not support
 * animation-timeline yet, so the @supports block in the stylesheet is the real
 * behaviour for a meaningful share of visitors: everything is simply visible,
 * already resolved. Nothing is gated behind the animation.
 */

const BEFORE = [
  { text: "results = []", tone: "plain" },
  { text: "for route in self.routes:", tone: "plain" },
  { text: "    results.extend(route_result.entries or [])", tone: "plain" },
  { text: "", tone: "plain" },
  { text: "default_result = self.default.ls(path)", tone: "plain" },
  { text: "results.extend(default_result.entries or [])", tone: "bad" },
  { text: "return ListResult(entries=results)", tone: "plain" },
] as const;

const AFTER = [
  { text: "default_result = self.default.ls(path)", tone: "plain" },
  { text: "if default_result.error:", tone: "good" },
  { text: "    return ListResult(error=default_result.error)", tone: "good" },
  { text: "results.extend(default_result.entries or [])", tone: "plain" },
] as const;

export default function DiffReveal() {
  /**
   * The one moment on the page that holds the scroll.
   *
   * The section pins and the reader drives the sequence with the scrollbar: the
   * swallowed error is struck out, the consequence lands, the guard writes
   * itself in line by line, and the merge credit resolves last. Scrubbed rather
   * than played, so it moves at whatever speed the reader moves and can be run
   * backwards, which is the difference between watching something and examining
   * it.
   *
   * Everything is readable before this runs and stays readable if it never
   * does. The stylesheet already resolves the whole diff for Safari and for
   * scripting off; this only takes the same elements and ties their progress to
   * scroll position. Pinning is limited to this one section, because a page that
   * pins twice has stopped being a document.
   */
  const ref = useMotion<HTMLDivElement>(({ gsap, ScrollTrigger }, root) => {
    const bad = root.querySelector(`.${styles.bad}`);
    const verdict = root.querySelector(`.${styles.verdict}`);
    const fixLines = root.querySelectorAll(`.${styles.fix} .${styles.line}`);
    const credit = root.querySelector(`.${styles.credit}`);

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        // Pins the trigger itself. Pinning the inner panel against an outer
        // trigger measured the two separately, so the panel went to fixed and
        // then kept travelling up the viewport to top: -433 while still pinned,
        // which reads as a bug rather than as a hold.
        pin: true,
        start: "top 12%",
        end: "+=110%",
        // A number rather than true: the sequence lags the scrollbar slightly,
        // which is what stops a fast flick from snapping through four states in
        // one frame.
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // The offending line is struck through rather than removed. The argument is
    // that this line looked correct, so it has to stay visible to be disbelieved.
    if (bad) {
      timeline.fromTo(
        bad,
        { "--strike": 0 },
        { "--strike": 1, duration: 1, ease: "none" },
        0,
      );
    }

    if (verdict) timeline.from(verdict, { opacity: 0, y: 10, duration: 0.6 }, 0.5);

    // Written in from the left, one line after another, in the order a person
    // would type them.
    if (fixLines.length) {
      timeline.from(
        fixLines,
        { opacity: 0, x: -12, duration: 0.5, stagger: 0.25 },
        1.1,
      );
    }

    if (credit) timeline.from(credit, { opacity: 0, duration: 0.5 }, 2.1);

    // Pinning measures in pixels, and the panel is above the fold on a short
    // window where fonts settle after the trigger is built.
    ScrollTrigger.refresh();
  });

  return (
    <div className={styles.stage} ref={ref}>
      <div className={styles.sticky}>
        <p className={styles.caption}>
          <a
            className={styles.repo}
            href="https://github.com/langchain-ai/deepagents"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubMark size={13} />
            <span className="label">langchain-ai/deepagents</span>
          </a>
          <span className={styles.path}>CompositeBackend.ls()</span>
        </p>

        <pre className={styles.code}>
          {BEFORE.map((line, i) => (
            <code
              key={i}
              className={line.tone === "bad" ? `${styles.line} ${styles.bad}` : styles.line}
            >
              {line.text || " "}
            </code>
          ))}
        </pre>

        <p className={styles.verdict}>
          The default backend failed. The caller was told the filesystem was healthy and nearly
          empty.
        </p>

        <pre className={`${styles.code} ${styles.fix}`}>
          {AFTER.map((line, i) => (
            <code
              key={i}
              className={line.tone === "good" ? `${styles.line} ${styles.good}` : styles.line}
            >
              {line.text}
            </code>
          ))}
        </pre>

        <p className={styles.credit}>
          Written and merged by a LangChain maintainer 57 hours after the report.{" "}
          <a
            href="https://github.com/langchain-ai/deepagents/pull/4925"
            target="_blank"
            rel="noreferrer"
          >
            PR #4925
          </a>
        </p>
      </div>
    </div>
  );
}
