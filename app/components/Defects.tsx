import { section } from "@/lib/content";
import styles from "./Defects.module.css";

/**
 * Failures this page shipped, each paired with the thing that now catches it.
 *
 * A portfolio that lists only what worked is describing a project that never
 * ran. These are real: they were live on this site or in its build, and every
 * one of them failed silently rather than throwing, which is the same class of
 * bug the published research is about. Read from the corpus, so the agent can
 * answer questions about them and the page cannot claim a guard that no longer
 * exists.
 */
export default function Defects({ limit = 4 }: { limit?: number }) {
  const s = section("Defects this page shipped and then fixed");
  const rows = s.defects.slice(0, limit);
  if (rows.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <h3 className={styles.head}>
        {s.defects.length} defects this page shipped, and what now stops each one
      </h3>
      <dl className={styles.list}>
        {rows.map((d) => (
          <div key={d.symptom} className={styles.row}>
            <dt className={styles.symptom}>{d.symptom}</dt>
            <dd className={styles.guard}>{d.guard}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.note}>
        None of these threw an exception. That is the point: a leaked monologue renders as text, a
        null token count renders as blank, and a missed pattern returns a confident answer to the
        wrong question.
      </p>
    </div>
  );
}
