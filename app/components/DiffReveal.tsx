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
  return (
    <div className={styles.stage}>
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
