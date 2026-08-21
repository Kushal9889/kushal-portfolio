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
  /** The least fakeable thing he owns, stated before the first scroll. */
  proof: string;
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
  proof,
  available,
  credential,
  contactHref,
  children,
}: Props) {
  const [trace, setTrace] = useState<Trace>({});
  const [active, setActive] = useState<NodeName | null>(null);
  const [done, setDone] = useState(false);
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
        if (!res.ok) return;
        const measured: Trace = await res.json();

        if (calm) {
          setTrace(measured);
          setDone(true);
          return;
        }

        for (const node of NODES) {
          if (measured[node] === undefined) continue;
          setActive(node);
          await new Promise((r) => setTimeout(r, 380));
          setTrace((prev) => ({ ...prev, [node]: measured[node] }));
        }
        setActive(null);
        setDone(true);
      } catch {
        // Offline, blocked, or the route is not deployed. The structure below
        // still tells the story; it just does so without numbers.
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
        <h1 className={`${styles.line} rise`}>
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
            twenty seconds is looking for these four words before they read a
            sentence, and search engines read them too. */}
        <p className={styles.current}>{current}</p>
        <p className={styles.focus}>{focus}</p>

        {/* The strongest claim, above the fold, where it is the second thing
            read rather than the first thing missed. Everything else in this
            hero is a system describing itself; this is the one line where an
            outside party did something in response to his work. */}
        <p className={styles.proof}>
          <a href="#opensource">{proof}</a>
        </p>

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
          ) : (
            <>ask anything below and this graph runs again</>
          )}
        </p>

        <div className={styles.actions}>
          <a className={styles.cta} href={contactHref} data-pull>
            Get in touch
          </a>
          <a className={styles.cred} href={credential.url} target="_blank" rel="noreferrer" data-pull>
            {credential.label}
          </a>
        </div>

        {/* The two facts that decide whether a recruiter writes at all, kept
            deliberately quiet. They gate the reply, so hiding them below six
            sections costs replies; setting them loud would make the page sound
            like it is asking rather than showing. */}
        <p className={styles.available}>Available {available}</p>

        {/* The demo sits above the fold because it is the strongest thing on the
            page and an unseen proof persuades nobody. Everything below it is
            supporting evidence for what this box already showed. */}
        <div className={styles.agentSlot}>{children}
        </div>
      </div>
    </header>
  );
}
