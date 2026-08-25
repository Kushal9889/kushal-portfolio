import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

/**
 * Publishes the passage index to Postgres, with a real HNSW index.
 *
 * The visitor's request path does not touch this. Retrieval serves from the
 * bundled index in memory, measured at 0.351ms for an exhaustive scan over all
 * 53 passages -- against 236-421ms for the network round trip that fetches the
 * query vector alone. A database in front of that would make the page slower to
 * answer a question it can already answer instantly, and Neon's free tier
 * scales to zero, so the first visitor after a quiet spell would pay a cold
 * start measured in seconds. On sporadic portfolio traffic that visitor is
 * likely to be a recruiter.
 *
 * So why does it exist. Because "a vector database is unnecessary here" is
 * either a measurement or an excuse, and the difference is whether the
 * alternative was actually built. This is the real thing -- real pgvector, real
 * HNSW, real SQL anyone can open -- and the page puts its measured latency next
 * to the in-process number so a reader can see the size of the trade rather
 * than take a sentence's word for it.
 *
 * `npm run sync:vectors`. Degrades to a warning when NEON_DATABASE_URL is
 * unset, the same way build-index.ts degrades without an embedding key.
 */

type Index = {
  passages: { parent: string; ordinal: number; text: string; tokens: number }[];
  parents: { title: string; source: string }[];
  vectors: number[][] | null;
};

async function main() {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    console.warn(
      "sync-vectors: NEON_DATABASE_URL not set, skipping.\n" +
        "  The page serves retrieval from the bundled index either way; only the\n" +
        "  live-database comparison is unavailable.",
    );
    return;
  }

  const index = JSON.parse(
    readFileSync(join(process.cwd(), "lib/agent/index.json"), "utf8"),
  ) as Index;

  if (!index.vectors) {
    console.error("sync-vectors: index has no vectors. Run `npm run build:index` with a key set.");
    process.exit(1);
  }

  const sql = neon(url);
  const dims = index.vectors[0].length;

  await sql`CREATE EXTENSION IF NOT EXISTS vector`;

  /*
   * Dropped and rebuilt rather than migrated.
   *
   * The corpus is the source of truth and it is rewritten on every build, so
   * the table is a projection of a file rather than a store anything owns. A
   * migration path here would be ceremony protecting data that is regenerated
   * from disk in under a minute.
   */
  await sql`DROP TABLE IF EXISTS passages`;
  // `unsafe` because a vector column's dimension is part of the type and cannot
  // be a bind parameter. The value is `index.vectors[0].length`, computed from
  // our own build output, never from input.
  await sql.query(`
    CREATE TABLE passages (
      id        integer PRIMARY KEY,
      parent    text NOT NULL,
      ordinal   integer NOT NULL,
      source    text NOT NULL,
      tokens    integer NOT NULL,
      body      text NOT NULL,
      embedding vector(${dims}) NOT NULL
    )
  `);

  const sourceOf = new Map(index.parents.map((p) => [p.title, p.source]));

  for (const [i, passage] of index.passages.entries()) {
    await sql`
      INSERT INTO passages (id, parent, ordinal, source, tokens, body, embedding)
      VALUES (
        ${i},
        ${passage.parent},
        ${passage.ordinal},
        ${sourceOf.get(passage.parent) ?? "facts"},
        ${passage.tokens},
        ${passage.text},
        ${JSON.stringify(index.vectors[i])}
      )
    `;
  }

  /*
   * HNSW rather than IVFFlat.
   *
   * IVFFlat needs a training pass over representative data and its recall
   * depends on the list count being right for the row count, which for a table
   * rebuilt on every deploy means retuning a parameter nobody will retune.
   * HNSW builds incrementally, needs no training, and its defaults are sane at
   * any size. The cost is a slower build and more memory, and at 53 rows both
   * are irrelevant -- which is itself the finding this table exists to show.
   *
   * `vector_cosine_ops` because the embedding model was trained against cosine.
   * These vectors are unit length, so `vector_l2_ops` would rank identically;
   * cosine is the one that says what is meant.
   */
  await sql`CREATE INDEX passages_embedding_idx ON passages USING hnsw (embedding vector_cosine_ops)`;

  // Metadata filtering is the one thing a database gives that the bundled index
  // does not, so the column it would filter on gets an index too.
  await sql`CREATE INDEX passages_parent_idx ON passages (parent)`;

  const [{ count }] = (await sql`SELECT count(*)::int AS count FROM passages`) as { count: number }[];
  console.log(`sync-vectors: ${count} passages, ${dims}-dim, HNSW on vector_cosine_ops`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
