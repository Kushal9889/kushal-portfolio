import type { Metric } from "@/lib/content";
import styles from "./Metrics.module.css";

/**
 * Quantified outcomes, set large enough to survive a scan.
 *
 * Sealed inside a paragraph these are invisible to a reader giving the page six
 * seconds, which is most of them. Pulled out and set at display size they become
 * the entry point: the eye lands on a number, and the prose underneath is there
 * for whoever wants the reasoning behind it.
 *
 * Emphasis comes from scale and weight, never colour. The accent means "live
 * right now" everywhere else on this page, and spending it on static text would
 * cost that word its meaning.
 */
export default function Metrics({ items }: { items: Metric[] }) {
  if (items.length === 0) return null;

  return (
    <dl className={styles.grid}>
      {items.map((m) => (
        <div key={m.label} className={styles.cell} data-sourced={m.source ? "" : undefined}>
          {/* Figures get display size; longer values are phrases rather than
              numbers, and setting them equally large makes them shout over the
              thing actually worth reading. */}
          <dt
            className={
              m.value.length > 6
                ? `${styles.value} ${styles.phrase} tabular`
                : `${styles.value} tabular`
            }
          >
            {m.value}
          </dt>
          <dd className={styles.label}>
            {m.label}
            {/* Where the figure comes from, attached to the figure.
                A number on a portfolio is worth exactly as much as the reader's
                willingness to believe it, and "resume" is an honest answer for
                a figure whose only witness is a former employer. A URL is a
                better one, and it is the reason this is a link when it can be. */}
            {m.source &&
              (m.source.startsWith("http") ? (
                <a
                  className={styles.source}
                  href={m.source}
                  target="_blank"
                  rel="noreferrer"
                  title={m.source}
                >
                  source
                </a>
              ) : (
                <span className={styles.source}>{m.source}</span>
              ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
