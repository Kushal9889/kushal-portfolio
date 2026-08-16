import type { Artifact } from "@/lib/content";
import { GitHubMark } from "./Mark";
import styles from "./Artifacts.module.css";

/**
 * Openable proof, one per row.
 *
 * These two links were previously a run-on line inside a paragraph, which put
 * the single strongest piece of evidence on the page at the same visual weight
 * as the sentence around it. They are the thing a sceptical reader clicks, so
 * they are given the room to be clicked.
 *
 * State is shown because it is the whole point: an issue anyone can open is not
 * evidence, and an issue that a maintainer closed with a merged fix is. The two
 * are distinguished the way GitHub itself distinguishes them, by naming the
 * state rather than by relying on a colour a reader has to decode.
 */
export default function Artifacts({ items }: { items: Artifact[] }) {
  if (items.length === 0) return null;

  return (
    <ul className={styles.list}>
      {items.map((a) => (
        <li key={a.url} className={styles.row}>
          <a className={styles.link} href={a.url} target="_blank" rel="noreferrer">
            <GitHubMark size={15} className={styles.mark} />
            <span className={styles.kind}>{a.kind}</span>
            <span className={styles.label}>{a.label}</span>
            <span className={styles.state} data-state={a.state}>
              {a.state}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
