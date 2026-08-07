"use client";

import { useState } from "react";
import data from "@/lib/agent/graph-data.json";
import styles from "./CorpusGraph.module.css";

type Node = { id: string; label: string; kind: string; stack: string[]; weight: number };
type Edge = { a: number; b: number; shared: string[] };

const nodes = data.nodes as Node[];
const edges = data.edges as Edge[];

/**
 * The corpus, drawn as the graph it already is.
 *
 * Every edge means two pieces of work share a technology, computed at build time
 * from the same file the page and the agent read. Nothing here is decorative:
 * moving a project between sections or dropping a dependency changes the picture
 * on the next build, and no connection can be drawn that the content does not
 * support.
 *
 * Layout is a fixed radial arrangement rather than a physics simulation. At six
 * nodes a force layout spends a frame budget to arrive somewhere arbitrary, and
 * a deterministic position means the picture is the same every visit, which is
 * what makes it recognisable rather than noisy.
 */
const W = 680;
const H = 380;

function position(i: number, total: number) {
  // The busiest node sits at the centre; the rest ring it. Degree is what
  // decides, so the middle is earned by the content rather than assigned.
  const degrees = nodes.map((_, n) => edges.filter((e) => e.a === n || e.b === n).length);
  const hub = degrees.indexOf(Math.max(...degrees));

  if (i === hub) return { x: W / 2, y: H / 2 };

  const others = total - 1;
  const rank = i > hub ? i - 1 : i;
  const angle = (rank / others) * Math.PI * 2 - Math.PI / 2;
  return {
    x: W / 2 + Math.cos(angle) * (W / 2 - 90),
    y: H / 2 + Math.sin(angle) * (H / 2 - 60),
  };
}

export default function CorpusGraph() {
  const [active, setActive] = useState<number | null>(null);
  const pts = nodes.map((_, i) => position(i, nodes.length));

  const connected = (i: number) =>
    active === null ||
    active === i ||
    edges.some((e) => (e.a === active && e.b === i) || (e.b === active && e.a === i));

  const activeEdges = active === null ? [] : edges.filter((e) => e.a === active || e.b === active);

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Graph of ${nodes.length} areas of work connected by ${edges.length} shared technologies`}
      >
        {edges.map((e, i) => {
          const lit = active !== null && (e.a === active || e.b === active);
          return (
            <line
              key={i}
              x1={pts[e.a].x}
              y1={pts[e.a].y}
              x2={pts[e.b].x}
              y2={pts[e.b].y}
              className={lit ? `${styles.edge} ${styles.edgeLit}` : styles.edge}
              strokeWidth={Math.min(3, e.shared.length)}
            />
          );
        })}

        {nodes.map((n, i) => (
          <g
            key={n.id}
            className={connected(i) ? styles.node : `${styles.node} ${styles.dim}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            tabIndex={0}
            role="button"
            aria-label={`${n.label}, ${n.stack.length} technologies`}
          >
            <circle
              cx={pts[i].x}
              cy={pts[i].y}
              r={active === i ? 9 : 6}
              className={active === i ? styles.dotLit : styles.dot}
            />
            <text x={pts[i].x} y={pts[i].y - 16} className={styles.label}>
              {n.label}
            </text>
          </g>
        ))}
      </svg>

      {/* The readout is the point. A picture of connected dots says nothing on its
          own; naming the shared technology is what turns it into a claim. */}
      <p className={styles.readout} aria-live="polite">
        {active === null ? (
          <>
            {nodes.length} areas of work, {edges.length} connections. Hover one.
          </>
        ) : (
          <>
            <strong>{nodes[active].label}</strong> shares{" "}
            {[...new Set(activeEdges.flatMap((e) => e.shared))].join(", ")} with{" "}
            {activeEdges.length} other {activeEdges.length === 1 ? "area" : "areas"}.
          </>
        )}
      </p>
    </div>
  );
}
