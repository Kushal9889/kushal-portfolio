import data from "@/lib/agent/graph-data.json";
import styles from "./CorpusMatrix.module.css";

type Node = { id: string; label: string; kind: string; stack: string[]; weight: number };
type Edge = { a: number; b: number; shared: string[] };

const nodes = data.nodes as Node[];
const edges = data.edges as Edge[];

/**
 * Every node against every other, both axes.
 *
 * The ring diagram beside this draws only the pairs that share something, which
 * makes the pairs that share nothing invisible. Here all 15 pairs are present
 * and an empty cell is a reading: those two pieces of work have no technology in
 * common. Absence carries as much information as connection, and it is the half
 * a node-link layout throws away.
 *
 * Cell weight is the count of shared technologies, so the matrix is a rendering
 * of the corpus rather than a drawing over it. Adding a project rewrites it.
 */
const shared = new Map<string, string[]>();
for (const e of edges) {
  shared.set(`${e.a}:${e.b}`, e.shared);
  shared.set(`${e.b}:${e.a}`, e.shared);
}

function cellFor(row: number, col: number) {
  return shared.get(`${row}:${col}`) ?? [];
}

/** Four steps. More would imply a precision that 0 to 7 shared items does not have. */
function band(count: number) {
  if (count === 0) return styles.none;
  if (count === 1) return styles.weak;
  if (count <= 3) return styles.mid;
  return styles.strong;
}

export default function CorpusMatrix() {
  const total = (nodes.length * (nodes.length - 1)) / 2;
  const connected = edges.length;

  return (
    <figure className={styles.figure}>
      <table className={styles.matrix}>
        <caption className={styles.caption}>
          Shared technologies between every pair. {connected} of {total} pairs share at least one;
          the rest share nothing, which is the point of showing all of them.
        </caption>

        <thead>
          <tr>
            <td className={styles.corner} />
            {nodes.map((n) => (
              <th key={n.id} scope="col" className={styles.colHead}>
                <span className={styles.colLabel}>{n.label}</span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {nodes.map((row, r) => (
            <tr key={row.id}>
              <th scope="row" className={styles.rowHead}>
                {row.label}
              </th>

              {nodes.map((col, c) => {
                if (r === c) {
                  return (
                    <td key={col.id} className={`${styles.cell} ${styles.self}`}>
                      <span className={styles.srOnly}>
                        {row.label}, {row.stack.length} technologies
                      </span>
                      <span aria-hidden="true" className={styles.diagonal}>
                        {row.stack.length}
                      </span>
                    </td>
                  );
                }

                const items = cellFor(r, c);
                return (
                  <td
                    key={col.id}
                    className={`${styles.cell} ${band(items.length)}`}
                    title={
                      items.length
                        ? `${row.label} and ${col.label}: ${items.join(", ")}`
                        : `${row.label} and ${col.label} share nothing`
                    }
                  >
                    <span className={styles.srOnly}>
                      {row.label} and {col.label}:{" "}
                      {items.length ? items.join(", ") : "no shared technology"}
                    </span>
                    <span aria-hidden="true" className="tabular">
                      {items.length || ""}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption className={styles.legend}>
        <span className={`${styles.key} ${styles.none}`} aria-hidden="true" />
        none
        <span className={`${styles.key} ${styles.weak}`} aria-hidden="true" />1
        <span className={`${styles.key} ${styles.mid}`} aria-hidden="true" />
        2 to 3
        <span className={`${styles.key} ${styles.strong}`} aria-hidden="true" />
        4 or more
        <span className={styles.diagonalNote}>Diagonal counts a node&rsquo;s own stack.</span>
      </figcaption>
    </figure>
  );
}
