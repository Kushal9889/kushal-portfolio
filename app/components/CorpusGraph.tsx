"use client";

import { useEffect, useRef, useState } from "react";
import data from "@/lib/agent/graph-data.json";
import { motionKit } from "@/lib/motion";
import styles from "./CorpusGraph.module.css";

type Node = { id: string; label: string; kind: string; stack: string[]; weight: number };
type Edge = { a: number; b: number; shared: string[] };

const nodes = data.nodes as Node[];
const edges = data.edges as Edge[];

/**
 * The corpus, drawn as the graph it already is, in two arrangements.
 *
 * Every edge means two pieces of work share a technology, computed at build time
 * from the same file the page and the agent read. Nothing here is decorative:
 * moving a project between sections or dropping a dependency changes the picture
 * on the next build, and no connection can be drawn that the content does not
 * support.
 *
 * The two views answer the two questions a reader actually has. "Connections"
 * asks what the work looks like as a whole; "Technology" asks what he keeps
 * using. They contain the same six nodes and the same eight edges, and switching
 * moves those nodes rather than redrawing them, which is the part that makes the
 * second view believable: it is visibly the same six things.
 *
 * Layout is computed, never a physics simulation. At six nodes a force layout
 * spends a frame budget to arrive somewhere arbitrary, and a deterministic
 * position means the picture is the same every visit.
 */
const W = 680;
const H = 380;

const degrees = nodes.map((_, n) => edges.filter((e) => e.a === n || e.b === n).length);
const HUB = degrees.indexOf(Math.max(...degrees));

/** The ring: busiest node centred, the rest around it. The middle is earned. */
function ringPositions() {
  return nodes.map((_, i) => {
    if (i === HUB) return { x: W / 2, y: H / 2 };
    const others = nodes.length - 1;
    const rank = i > HUB ? i - 1 : i;
    const angle = (rank / others) * Math.PI * 2 - Math.PI / 2;
    return {
      x: W / 2 + Math.cos(angle) * (W / 2 - 90),
      y: H / 2 + Math.sin(angle) * (H / 2 - 60),
    };
  });
}

/**
 * Each node's most widely shared technology.
 *
 * Not a taxonomy invented for the picture. For every technology a node uses, it
 * counts how many other nodes use the same one and keeps the highest, so the
 * grouping falls out of the corpus and changes when the corpus does. A node
 * sharing nothing is grouped under its own name rather than being hidden.
 */
function primaryTech(i: number) {
  let best = nodes[i].label;
  let bestCount = 0;
  for (const t of nodes[i].stack) {
    const count = nodes.filter((o, j) => j !== i && o.stack.includes(t)).length;
    if (count > bestCount) {
      bestCount = count;
      best = t;
    }
  }
  return best;
}

const GROUPS = (() => {
  const map = new Map<string, number[]>();
  nodes.forEach((_, i) => {
    const key = primaryTech(i);
    map.set(key, [...(map.get(key) ?? []), i]);
  });
  // Widest group first, so the eye starts where the most work overlaps.
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
})();

/** Columns, one per shared technology, nodes stacked inside. */
function stackPositions() {
  const pts = nodes.map(() => ({ x: 0, y: 0 }));
  const colW = W / GROUPS.length;
  GROUPS.forEach(([, members], c) => {
    const x = colW * c + colW / 2;
    members.forEach((i, r) => {
      // 92, not 74: the invisible hit ring below needs a real 44px touch target
      // at the narrowest width this renders at, and two adjacent rings closer
      // than their combined radius would overlap.
      pts[i] = { x, y: 128 + r * 92 };
    });
  });
  return pts;
}

const LAYOUTS = { connections: ringPositions(), technology: stackPositions() };
type View = keyof typeof LAYOUTS;

export default function CorpusGraph() {
  const [active, setActive] = useState<number | null>(null);
  const [view, setView] = useState<View>("connections");

  const pts = LAYOUTS[view];
  const groupRefs = useRef<(SVGGElement | null)[]>([]);
  const edgeRefs = useRef<(SVGLineElement | null)[]>([]);
  const previous = useRef(pts);

  /**
   * Move the nodes from where they were to where they now are.
   *
   * React has already rendered the new arrangement, so the markup is correct
   * before any of this runs and a visitor without the motion bundle simply sees
   * the other view immediately. The tween only replays the distance travelled,
   * which means a failure here costs the movement and never the picture.
   */
  useEffect(() => {
    const from = previous.current;
    const to = pts;
    previous.current = to;
    if (from === to) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let live = true;
    motionKit().then(({ gsap }) => {
      if (!live) return;

      groupRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { x: from[i].x - to[i].x, y: from[i].y - to[i].y },
          { x: 0, y: 0, duration: 0.75, ease: "power3.inOut" },
        );
      });

      // Edges cannot ride along on a transform, because their two ends belong to
      // different nodes travelling different distances.
      edgeRefs.current.forEach((el, i) => {
        if (!el) return;
        const e = edges[i];
        gsap.fromTo(
          el,
          {
            attr: { x1: from[e.a].x, y1: from[e.a].y, x2: from[e.b].x, y2: from[e.b].y },
          },
          {
            attr: { x1: to[e.a].x, y1: to[e.a].y, x2: to[e.b].x, y2: to[e.b].y },
            duration: 0.75,
            ease: "power3.inOut",
          },
        );
      });
    });

    return () => {
      live = false;
    };
  }, [pts]);

  const connected = (i: number) =>
    active === null ||
    active === i ||
    edges.some((e) => (e.a === active && e.b === i) || (e.b === active && e.a === i));

  const activeEdges = active === null ? [] : edges.filter((e) => e.a === active || e.b === active);

  return (
    <div className={styles.wrap}>
      <div className={styles.views} role="group" aria-label="Graph arrangement">
        {(Object.keys(LAYOUTS) as View[]).map((v) => (
          <button
            key={v}
            type="button"
            className={styles.viewButton}
            aria-pressed={view === v}
            onClick={() => setView(v)}
          >
            {v === "connections" ? "By connection" : "By shared technology"}
          </button>
        ))}
      </div>

      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Graph of ${nodes.length} areas of work connected by ${edges.length} shared technologies, arranged by ${view}`}
      >
        {view === "technology" &&
          GROUPS.map(([tech], c) => (
            <text
              key={tech}
              x={(W / GROUPS.length) * c + W / GROUPS.length / 2}
              y={78}
              className={styles.column}
            >
              {tech}
            </text>
          ))}

        {edges.map((e, i) => {
          const lit = active !== null && (e.a === active || e.b === active);
          return (
            <line
              key={i}
              ref={(el) => {
                edgeRefs.current[i] = el;
              }}
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
            ref={(el) => {
              groupRefs.current[i] = el;
            }}
            className={connected(i) ? styles.node : `${styles.node} ${styles.dim}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            tabIndex={0}
            role="button"
            aria-label={`${n.label}, ${n.stack.length} technologies`}
          >
            {/* Invisible, sized in the SVG's own coordinate space rather than
                screen pixels. The container renders as narrow as ~335px on a
                phone against a 680-unit viewBox (scale ~0.49), so a real 44px
                target needs r=45 here; at desktop widths, where the container
                is close to the viewBox's own size, that is comfortably more
                than 44px and never a problem, only unused margin. The visible
                dot stays 6px because that is what the picture needs. */}
            <circle cx={pts[i].x} cy={pts[i].y} r={45} className={styles.hit} />
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
