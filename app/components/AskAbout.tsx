import { mailtoLink, type ReachContext } from "@/lib/reach";
import styles from "./AskAbout.module.css";

/**
 * A written draft at the point of conviction, not only at the bottom of the page.
 *
 * `lib/reach.ts` carries six openers, one per section, each naming the specific
 * thing the reader was looking at. Only the general one was reachable, because
 * the contact block is the sole caller and it sits seven sections down. A reader
 * persuaded by the LangChain fix had to scroll past everything else to act, and
 * arrived with the least specific opener of the six.
 *
 * This closes that gap without repeating the contact block: one line, one link,
 * placed where the argument lands. The draft it opens references the section by
 * name, so a message sent from here is already specific on arrival.
 */
export default function AskAbout({
  email,
  site,
  context,
  label,
}: {
  email: string;
  site: string;
  context: ReachContext;
  label: string;
}) {
  return (
    <p className={styles.row}>
      <a className={styles.link} href={mailtoLink(email, site, context)}>
        {label}
      </a>
      <span className={styles.hint}>opens a draft that already mentions this</span>
    </p>
  );
}
