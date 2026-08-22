import styles from "./Panel.module.css";

/**
 * One instrument.
 *
 * Every live thing on this page is a panel: a header strip saying what it is on
 * the left and what it is doing on the right, then the instrument itself. The
 * hero's agent block established the shape; this is that shape extracted so the
 * topology graph, the rank fusion figure and the trace are not three
 * hand-authored approximations of it.
 *
 * The ground carries the meaning. `console` is dark and means this runs; paper
 * is light and means this was written. A panel that renders on the console
 * ground has to contain something that actually changes at runtime, which
 * `scripts/audit.ts` check 13.2 enforces, because a dark box chosen for looks
 * would cost the ground its meaning everywhere else.
 */
export type PanelState = "idle" | "running" | "done" | "degraded";

export default function Panel({
  label,
  state = "idle",
  status,
  surface = "console",
  children,
  className,
}: {
  /** What the instrument is. Set in caps at label scale, left of the strip. */
  label: string;
  /** What it is doing. Drives the dot and is read by assistive tech. */
  state?: PanelState;
  /** The measured value or condition, right of the strip. Omitted when idle. */
  status?: React.ReactNode;
  surface?: "console" | "paper";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={className ? `${styles.panel} ${className}` : styles.panel}
      data-surface={surface}
      data-state={state}
    >
      <header className={styles.head}>
        <span className={styles.label}>{label}</span>
        {status !== undefined && (
          <span className={styles.status}>
            {/* Only a running instrument gets the pulse. A dot that always
                breathes is decoration; this one means a request is in flight. */}
            <span className="live-dot" data-state={state === "running" ? "running" : undefined} />
            {status}
          </span>
        )}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
