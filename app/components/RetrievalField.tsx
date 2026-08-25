"use client";

import { useEffect, useState } from "react";
import field from "@/lib/agent/field.json";
import { RETRIEVAL_EVENT } from "./Agent";
/* The shape comes from the retriever that produces it.
 *
 * This file declared its own `FusionRow` and `Trace` copies of `FusionRow` and
 * `RetrievalTrace`, so the figure and the thing it draws could drift by a field
 * without either side noticing. `FusionRow` is exported now and there is one
 * definition. */
import type { RetrievalTrace, FusionRow } from "@/lib/agent/retrieve";
import Panel from "./Panel";
import styles from "./RetrievalField.module.css";

/**
 * Reciprocal rank fusion, drawn from the run that just happened.
 *
 * This started as a 3D scatter of the corpus embeddings and was cut on
 * measurement. The vectors are 1024-dimensional and there are 16 of them:
 * classical MDS onto three axes captures 47.4% of the variance, 80% needs seven
 * axes, and Kruskal stress lands at 0.38, which is "poor" by any convention. A
 * 3D cloud would have looked expensive and thrown away more than half the
 * structure, on a page whose first rule is that a claim the reader cannot check
 * is a bug. The stress number is kept in `lib/agent/field.json` and printed
 * below, because the failed projection is itself worth being honest about.
 *
 * What survives measurement is rank. Every number here was computed by
 * `retrieve()` on the way to the answer above: BM25 rank on the left, dense
 * cosine rank in the middle, fused rank on the right, joined per chunk.
 *
 * The crossings are the entire point. When a chunk enters at lexical rank 5 and
 * leaves at fused rank 1, that line is reciprocal rank fusion overruling keyword
 * search in public, with the arithmetic visible. Nothing here is arranged for
 * effect: move a chunk and the line moves because the retriever moved it.
 */

const N = field.points.length;

/** Column x positions in the 0-100 viewBox. */
const COL = { lex: 16, dense: 50, fused: 84 };

/** Rows are evenly spaced; rank 1 sits at the top. */
const y = (rank: number) => 6 + ((rank - 1) / (N - 1)) * 88;

/** A flat-shouldered cubic, so lines leave and arrive horizontally and the
 *  crossings in the middle stay readable instead of turning into a knot. */
function link(x1: number, y1: number, x2: number, y2: number) {
  const dx = (x2 - x1) * 0.45;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export default function RetrievalField() {
  const [live, setLive] = useState<RetrievalTrace | null>(null);

  // Listens rather than receiving a prop: the agent is in the hero, this is
  // three sections down, and the page between them is server rendered.
  useEffect(() => {
    const onRetrieval = (e: Event) => setLive((e as CustomEvent<RetrievalTrace>).detail);
    window.addEventListener(RETRIEVAL_EVENT, onRetrieval);
    return () => window.removeEventListener(RETRIEVAL_EVENT, onRetrieval);
  }, []);

  const rows = live?.rows ?? null;

  /*
   * How decisively a chunk won, not only that it won.
   *
   * The figure has always plotted ordinal position, and every question also
   * produces thirty-six real floats -- the raw BM25 scores and the fused RRF
   * totals -- that were computed and never drawn. Rank alone cannot tell a
   * chunk that beat the field from one that squeaked past the next: both are
   * "1" and "2". Normalised against the leader so the bars are a share of the
   * best score rather than an absolute nobody can calibrate.
   */
  const peakLexical = Math.max(...(rows?.map((r) => r.lexicalScore) ?? [0]), 1e-9);
  const peakFused = Math.max(...(rows?.map((r) => r.fused) ?? [0]), 1e-9);

  // At rest, before anything has been asked: the corpus in its own order, with
  // no ranking claimed. Ordering by title would imply a relationship the page
  // has not earned yet.
  const resting = field.points.map((p, i) => ({
    title: p.title,
    lexicalRank: i + 1,
    denseRank: i + 1,
    fusedRank: i + 1,
    selected: false,
    lexicalScore: 0,
    fused: 0,
  }));

  const ranked = rows
    ? (() => {
        const byFused = [...rows]
          .map((r, i) => ({ r, i }))
          .sort((a, b) => b.r.fused - a.r.fused);
        const fusedRank = new Map(byFused.map((x, k) => [x.i, k + 1]));
        return rows.map((r, i) => ({
          title: r.title,
          // A chunk absent from a retriever is parked at the bottom rather than
          // hidden, so the eye can see that it scored nothing at all.
          lexicalRank: r.lexicalRank ?? N,
          denseRank: r.denseRank ?? N,
          fusedRank: fusedRank.get(i) ?? N,
          selected: r.selected,
          lexicalScore: r.lexicalScore,
          fused: r.fused,
        }));
      })()
    : resting;

  const denseOff = live ? !live.denseUsed : false;

  return (
    <Panel
      label="rank fusion"
      state={live ? "done" : "idle"}
      status={
        live
          ? `${live.rows.filter((r) => r.selected).length} of ${live.rows.length} kept`
          : `${field.n} chunks at rest`
      }
    >
      <figure className={styles.wrap}>
      <div className={styles.head}>
        <span className="label">bm25 rank</span>
        <span className="label">
          {denseOff ? "dense skipped" : "dense rank"}
        </span>
        <span className="label">fused</span>
      </div>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={styles.svg}
        role="img"
        tabIndex={0}
        aria-label={
          live
            ? `Reciprocal rank fusion for the last question. ${ranked.filter((r) => r.selected).length} of ${N} corpus sections were selected.`
            : `The ${N} sections of the corpus, before any question has been asked.`
        }
      >
        {[COL.lex, COL.dense, COL.fused].map((x) => (
          <line key={x} className={styles.axis} x1={x} y1="2" x2={x} y2="98" />
        ))}

        {ranked.map((r, i) => (
          <g
            key={r.title}
            className={r.selected ? styles.pathOn : styles.path}
            style={{ "--i": i } as React.CSSProperties}
          >
            <path d={link(COL.lex, y(r.lexicalRank), COL.dense, y(r.denseRank))} />
            <path
              className={denseOff ? styles.muted : undefined}
              d={link(COL.dense, y(r.denseRank), COL.fused, y(r.fusedRank))}
            />
            {/* Magnitude, drawn back from each axis. Width is the score as a
                share of the leader; a chunk that barely scored gets a stub. */}
            {rows && r.lexicalScore > 0 && (
              <rect
                className={styles.mag}
                x={COL.lex - (r.lexicalScore / peakLexical) * 12}
                y={y(r.lexicalRank) - 1}
                width={(r.lexicalScore / peakLexical) * 12}
                height="2"
              />
            )}
            {rows && r.fused > 0 && (
              <rect
                className={styles.mag}
                x={COL.fused}
                y={y(r.fusedRank) - 1}
                width={(r.fused / peakFused) * 12}
                height="2"
              />
            )}
            <circle cx={COL.lex} cy={y(r.lexicalRank)} r="0.9" />
            <circle cx={COL.dense} cy={y(r.denseRank)} r="0.9" />
            <circle cx={COL.fused} cy={y(r.fusedRank)} r={r.selected ? 1.5 : 0.9} />
          </g>
        ))}
      </svg>

      <figcaption className={styles.caption} aria-live="polite">
        {live ? (
          <>
            <strong>{ranked.filter((r) => r.selected).length}</strong> of {N} sections selected by
            reciprocal rank fusion at k={live.k}
            {". Lines that cross are the dense retriever overruling keyword rank."}
          </>
        ) : (
          <>
            {N} sections, ranked the moment you ask something above. Left is keyword rank, middle is
            embedding rank, right is the fusion of both.
          </>
        )}
        {/* Only claimed when a projection was actually computed. Built without
            an embedding key there are no vectors, so there is no stress to
            report and the sentence would be describing work that never ran. */}
        {field.stress !== null && (
          <span className={styles.stress}>
            3D projection of these {field.n} vectors was cut: Kruskal stress {field.stress}, and the
            three plotted axes keep only{" "}
            {Math.round((field.varianceKept ?? 0) * 100)}% of the variance. Rank is exact, so rank is
            what is drawn.
          </span>
        )}
        </figcaption>
      </figure>
    </Panel>
  );
}
