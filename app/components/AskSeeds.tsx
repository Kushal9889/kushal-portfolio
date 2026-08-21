"use client";

import { ASK_EVENT } from "./Agent";
import styles from "./AskSeeds.module.css";
import { track } from "@/lib/analytics";

/**
 * The questions this section can answer, offered where the curiosity is.
 *
 * A visitor who does not know what to ask asks nothing, and the three openers in
 * the hero are spent before the reader has seen any of the work. These are
 * written into the corpus with `@ask`, beside the section that answers them, so
 * the prompt appears at the moment the reader has just finished reading the
 * thing it is about.
 *
 * The agent lives in the hero, so the click travels as an event rather than
 * through props: page.tsx is a server component and threading state through it
 * would turn the whole document into a client bundle to move one string.
 */
export default function AskSeeds({ items }: { items: { question: string }[] }) {
  if (items.length === 0) return null;

  return (
    <ul className={styles.seeds}>
      {items.map((a) => (
        <li key={a.question}>
          <button
            className={styles.seed}
            onClick={() => {
              track("agent_asked", a.question);
              window.dispatchEvent(new CustomEvent<string>(ASK_EVENT, { detail: a.question }));
            }}
          >
            <span className={styles.mark} aria-hidden="true">
              ask
            </span>
            {a.question}
          </button>
        </li>
      ))}
    </ul>
  );
}
