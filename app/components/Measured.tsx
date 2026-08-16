import evals from "@/content/evals.json";
import styles from "./Measured.module.css";

/**
 * The evaluation suite, reporting its own last run.
 *
 * Every number here is written by `npm run test:evals` into `content/evals.json`
 * and read back at build time. None of it is typed by hand, which is the only
 * reason it is allowed on the page: a latency a reader cannot trace is exactly
 * the kind of claim this site exists not to make.
 *
 * The date is shown with the figures rather than hidden in a footer, because an
 * eval result is only true of the build that produced it. A stale date is
 * information too.
 */
const ROWS = [
  {
    value: `${evals.passed}/${evals.cases}`,
    label: "assertions pass",
    note: "Not that the agent answered. That it refused the pirate prompt, declined to reveal its system prompt, and gave the same work-authorisation answer to both phrasings of the question.",
  },
  {
    value: `${evals.p50}ms`,
    label: "median answer",
    note: "End to end, retrieval through generation, against a free tier with no warm instance held open.",
  },
  {
    value: `${evals.p95}ms`,
    label: "95th percentile",
    note: "The slow tail is the honest number. It is what a visitor gets when the provider is busy and the request is not cached.",
  },
];

export default function Measured() {
  return (
    <div className={styles.wrap}>
      <dl className={styles.grid}>
        {ROWS.map((r) => (
          <div key={r.label} className={styles.row}>
            <dt className={styles.head}>
              <span className={`${styles.value} tabular`}>{r.value}</span>
              <span className="label">{r.label}</span>
            </dt>
            <dd className={styles.note}>{r.note}</dd>
          </div>
        ))}
      </dl>

      <p className={styles.foot}>
        Measured <time dateTime={evals.measured}>{evals.measured}</time> by{" "}
        <code>npm run test:evals</code>, which writes the file this section reads. Nothing here is
        entered by hand, so the figures cannot drift from the run that produced them.
      </p>
    </div>
  );
}
