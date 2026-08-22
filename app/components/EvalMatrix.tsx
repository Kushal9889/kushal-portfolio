"use client";

import { useState } from "react";
import evals from "@/content/evals.json";
import Panel from "./Panel";
import styles from "./EvalMatrix.module.css";

/**
 * The eval suite, as sixteen objects rather than one score.
 *
 * "16/16 passed" is four different claims wearing one number, and the strongest
 * of them is the least visible: six of these cases are attempts to make the
 * agent misbehave, and passing means the model was never reached at all. A
 * reader who sees six deflections in a row has been told something a ratio
 * cannot say.
 *
 * Deliberately not a grid of green squares. That shape is a contribution
 * calendar, it restates the number printed directly above it, and it encodes
 * pass -- which is the baseline expectation -- rather than group, which is the
 * information. Colour here is the kind of case; the mark is the outcome.
 *
 * Every value is read from `content/evals.json`, written by `npm run test:evals`
 * from the run that produced it. Nothing here is authored.
 */
const GROUPS = [
  {
    key: "grounding",
    label: "grounding",
    says: "the answer reproduces a figure that exists in the corpus",
  },
  {
    key: "policy",
    label: "policy",
    says: "compensation, personal life and prompt overrides never reach a model",
  },
  {
    key: "authorisation",
    label: "authorisation",
    says: "asked, it answers exactly; unasked, it never raises the subject",
  },
  {
    key: "out-of-corpus",
    label: "out of corpus",
    says: "a question the corpus cannot answer produces no invention",
  },
] as const;

type Case = { name: string; group: string; asserts: string; pass: boolean };

/**
 * Whether a provider was ever called for this case.
 *
 * Read from the assertion the runner wrote rather than stored separately: a
 * case asserting it routes to `deflect` or `authorisation` is one the policy
 * layer answered on its own. That is the strongest thing the suite proves and
 * a pass/fail ratio cannot say it.
 */
function reachedModel(c: Case) {
  return !/routes to (deflect|authorisation)/.test(c.asserts);
}

export default function EvalMatrix() {
  const cases = (evals.cases_detail ?? []) as Case[];
  const [open, setOpen] = useState<string | null>(null);
  if (cases.length === 0) return null;

  const failed = cases.filter((c) => !c.pass).length;

  return (
    /* Paper, not console.
     *
     * This is an instrument and it is interactive, which is enough to satisfy
     * the console check, and it would look better dark. It is still a published
     * result from a build-time run rather than something happening while a
     * reader looks at it, and the ground has to keep meaning exactly one thing
     * or it stops being information. Dark is the agent, the compiled graph and
     * the fusion figure, which change on the page in front of you. */
    <Panel
      label="eval suite"
      surface="paper"
      state={failed ? "degraded" : "done"}
      status={`${evals.passed}/${evals.cases} · ${evals.measured}`}
    >
      <div className={styles.groups}>
        {GROUPS.map((g) => {
          const inGroup = cases.filter((c) => c.group === g.key);
          if (inGroup.length === 0) return null;
          return (
            <div key={g.key} className={styles.group} data-group={g.key}>
              <div className={styles.groupHead}>
                <span className={styles.groupLabel}>{g.label}</span>
                <span className={`${styles.groupCount} tabular`}>
                  {inGroup.filter((c) => c.pass).length}/{inGroup.length}
                </span>
              </div>

              <ul className={styles.cells}>
                {inGroup.map((c, i) => (
                  <li key={c.name}>
                    <button
                      type="button"
                      className={styles.cell}
                      data-outcome={c.pass ? "passed" : "failed"}
                      data-reached-model={String(reachedModel(c))}
                      data-open={open === c.name || undefined}
                      style={{ "--i": i } as React.CSSProperties}
                      aria-expanded={open === c.name}
                      aria-label={`${c.name}. Asserts ${c.asserts}. ${c.pass ? "Passed" : "Failed"}.${reachedModel(c) ? "" : " No model was called."}`}
                      onClick={() => setOpen(open === c.name ? null : c.name)}
                    />
                  </li>
                ))}
              </ul>

              <p className={styles.says}>{g.says}</p>
            </div>
          );
        })}
      </div>

      {/* One case at a time, in place. A list of sixteen assertions is a wall on
          a page that has to be skimmable; a reader who wants one gets one. */}
      <div className={styles.detail} aria-live="polite">
        {open ? (
          <>
            <p className={styles.detailQ}>{open}</p>
            <p className={styles.detailA}>{cases.find((c) => c.name === open)?.asserts}</p>
          </>
        ) : (
          <p className={styles.detailHint}>
            Every cell is one case. Open one to read the assertion the runner wrote for it.
          </p>
        )}
      </div>
    </Panel>
  );
}
