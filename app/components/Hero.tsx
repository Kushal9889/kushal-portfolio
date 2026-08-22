"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";

const NODES = ["route", "retrieve", "answer"] as const;
type NodeName = (typeof NODES)[number];

/** Timings arrive per node as the graph executes. Absent until measured. */
type Trace = Partial<Record<NodeName, number>>;

type Props = {
  name: string;
  tagline: string;
  location: string;
  /** Where he works right now. A recruiter scans for employer and title before
   *  anything else, and the hero named neither. */
  current: string;
  /** What he builds, in the words a 2026 role is written in. */
  focus: string;
  /** The least fakeable thing he owns, stated before the first scroll.
   *
   *  Split into a figure and a sentence rather than passed as one string. A
   *  recruiter decides whether to keep reading in two to three seconds, against
   *  the largest and highest-contrast object on the page, and this claim -- an
   *  outside maintainer acting on his work -- was previously set at the same
   *  size as the four gray lines around it. A number set as a number is a
   *  difference in kind, not in degree, which is what the isolation effect
   *  actually requires. */
  evidence: { figure: string; unit: string; sentence: string; href: string; label: string };
  /** When he can start, and where. The question that gates a reply. */
  available: string;
  credential: { label: string; url: string };
  contactHref: string;
  /** The agent itself, rendered under the graph it just traced. */
  children?: React.ReactNode;
};

/**
 * The hero runs one real query against the agent on mount and renders the graph
 * traversing its nodes with the actual per-node timings.
 *
 * It is deliberately silent and requires no interaction: the first thing a
 * visitor sees has to work with the sound off, on a phone, before any permission
 * prompt. Voice is offered further down for anyone who wants it.
 *
 * If the agent is unreachable the graph still renders its structure and simply
 * shows no numbers. Nothing here ever displays a placeholder value, because a
 * fabricated latency is the easiest claim on a page like this to disprove.
 */
export default function Hero({
  name,
  tagline,
  location,
  current,
  focus,
  evidence,
  available,
  credential,
  contactHref,
  children,
}: Props) {
  const [trace, setTrace] = useState<Trace>({});
  const [active, setActive] = useState<NodeName | null>(null);
  const [done, setDone] = useState(false);
  /** Set when the demo endpoint could not be reached, so the caption says so. */
  const [unreachable, setUnreachable] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Respect a visitor who has asked for less motion: still fetch, but skip the
    // staged node highlight and settle straight to the final numbers.
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/agent/demo", { signal: controller.signal });
        if (!res.ok) {
          setUnreachable(true);
          return;
        }
        const measured: Trace = await res.json();

        if (calm) {
          setTrace(measured);
          setDone(true);
          return;
        }

        // Paced to what was actually measured, not to a fixed beat. A flat
        // 380ms per node put a floor of 1.14s under every reveal, so a fast
        // answer was displayed as though it had been slow. Floored at 90ms so
        // the sequence still reads as three discrete steps rather than a flash.
        const total = NODES.reduce((sum, n) => sum + (measured[n] ?? 0), 0);
        const step = Math.max(90, Math.min(380, total / NODES.length));

        for (const node of NODES) {
          if (measured[node] === undefined) continue;
          setActive(node);
          await new Promise((r) => setTimeout(r, step));
          setTrace((prev) => ({ ...prev, [node]: measured[node] }));
        }
        setActive(null);
        setDone(true);
      } catch (err) {
        // Offline, blocked, or the route is not deployed. The structure above
        // still tells the story; it just does so without numbers. Stated rather
        // than left hanging: the caption used to sit on "ask anything below" for
        // ever, which reads as a page still loading rather than one whose demo
        // endpoint is down.
        if ((err as Error)?.name !== "AbortError") setUnreachable(true);
      }
    })();

    return () => controller.abort();
  }, []);

  const total = Object.values(trace).reduce((a, b) => a + b, 0);

  return (
    <header className={styles.hero}>
      <div className="wrap">
        <div className={styles.top}>
          <span className={styles.name}>{name}</span>
          <span className="label">{location}</span>
        </div>

        {/* Split on the sentence boundary: the claim leads, the qualifier
            recedes. Falls back to the whole string if the shape ever changes. */}
        <h1 className={styles.line}>
          {(() => {
            const cut = tagline.indexOf(". ");
            if (cut === -1) return tagline;
            return (
              <>
                {tagline.slice(0, cut + 1)}{" "}
                <span className="quiet">{tagline.slice(cut + 2)}</span>
              </>
            );
          })()}
        </h1>

        {/* What he builds, in the vocabulary the roles are written in.
            The headline is the voice; this is the scan. Someone deciding in
            twenty seconds is looking for these words before they read a
            sentence, and search engines read them too. */}
        <p className={`${styles.current} rise`} style={{ "--rise-n": 0 } as React.CSSProperties}>
          {current}
        </p>
        <ul className={`${styles.focus} rise`} style={{ "--rise-n": 1 } as React.CSSProperties}>
          {focus.split(/\s*[·]\s*/).filter(Boolean).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        {/* The one object on this page that looks like nothing else on it.
            Everything else in the hero is a system describing itself; this is
            the single line where an outside party did something in response to
            his work, and it is the only claim here that no other candidate can
            copy. It gets a figure, a border and more surrounding space than
            anything else, because difference in kind is what a scanning eye
            stops for. */}
        <a
          className={`${styles.evidence} rise`}
          style={{ "--rise-n": 2 } as React.CSSProperties}
          href={evidence.href}
        >
          <span className={styles.evidenceFigure}>
            <span className={`${styles.evidenceNumber} tabular`}>{evidence.figure}</span>
            <span className={styles.evidenceUnit}>{evidence.unit}</span>
          </span>
          <span className={styles.evidenceBody}>
            <span className={styles.evidenceSentence}>{evidence.sentence}</span>
            <span className={styles.evidenceLabel}>{evidence.label}</span>
          </span>
        </a>

        {/* The two facts that decide whether a recruiter writes at all, kept
            deliberately quiet. Moved above the graph block: on a 13-inch laptop
            it sat below three cells and a caption, which put the one number
            that gates a reply outside the first screen. */}
        <p className={styles.available}>Available {available}</p>

        {/* One instrument, not two.
            The graph and the agent were separated by the availability line and
            two buttons, so the thing that had just run and the box that runs it
            again read as unrelated furniture. They are the same object: this
            panel shows the request the page made on load, and the input under
            it makes another. The console ground says the whole block is live. */}
        <div className={styles.console} data-surface="console">
          <div className={styles.consoleHead}>
            <span className={styles.consoleLabel}>agent</span>
            <span className={styles.consoleState} data-state={done ? "done" : unreachable ? "degraded" : "running"}>
              <span className="live-dot" data-state={done || unreachable ? undefined : "running"} />
              {done ? `${total}ms` : unreachable ? "unreachable" : "running"}
            </span>
          </div>

          {/* The graph, drawn rather than written.
              Each node is a cell with a rail running through it; the rail fills as
              that node completes, so the row reads as a system executing instead of
              a line of log output. Timings sit under the node they belong to. */}
          <div className={styles.graph} aria-hidden="true">
            {NODES.map((node, i) => {
              const ms = trace[node];
              const state = active === node ? "running" : ms !== undefined ? "done" : "idle";
              return (
                <div key={node} className={styles.cell} data-state={state}>
                  <div className={styles.rail}>
                    {i > 0 && <span className={styles.railLine} />}
                    <span className={styles.dot} />
                    {i < NODES.length - 1 && <span className={styles.railLine} />}
                  </div>
                  <span className={styles.label}>{node}</span>
                  <span className={`${styles.ms} tabular`}>
                    {ms !== undefined ? `${ms}ms` : state === "running" ? "\u00b7\u00b7\u00b7" : ""}
                  </span>
                </div>
              );
            })}
          </div>

          <p className={styles.caption}>
            {done ? (
              <>
                <span className="live-dot" /> answered in{" "}
                <span className="tabular">{total}ms</span>, measured on this page load
              </>
            ) : unreachable ? (
              <>the demo endpoint is unreachable right now; the box below still answers</>
            ) : (
              <>ask anything below and this graph runs again</>
            )}
          </p>


          <div className={styles.agentSlot}>{children}</div>
        </div>

        {/* Below the instrument, not above it.
            These two sat between the evidence block and the console and pushed
            the one live thing on the page to 806px, which on a 13-inch laptop
            is off the first screen entirely. A reader who wants to write has
            already decided; a reader who has not seen the agent work has not. */}
        <div className={styles.actions}>
          <a className={styles.cta} href={contactHref} data-pull>
            Get in touch
          </a>
          <a className={styles.cred} href={credential.url} target="_blank" rel="noreferrer" data-pull>
            {credential.label}
          </a>
        </div>
      </div>
    </header>
  );
}
