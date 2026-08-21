# CLAUDE.md

Context for this repository. Written so a session starting cold does not repeat
research already done, does not re-litigate settled decisions, and does not
reintroduce defects already fixed once.

Everything here is inline on purpose. Links rot and sessions get cleared.

---

## What this is

Kushal Gaddamwar's portfolio. A single Next.js app with a LangGraph agent that
answers questions about him from a corpus of his own facts.

The site's argument is that the agent on it is a working artifact rather than a
claim, so **anything that makes a claim the reader cannot check is a bug**.

Replaces a previous version that shipped hardcoded telemetry (`agents_active: 3`,
`cache_hit_rate: 67`) rendered as live data, a "voice agent" that was eight
hardcoded sentences with no microphone, and every fact stored twice in two places
that had already drifted apart.

---

## Hard rules

Violating any of these has broken something real in this repo before.

1. **One source of truth.** Every fact lives in `content/facts.md` or
   `content/certifications.json`. Never inline a fact in a component. `verify:facts`
   fails the build otherwise.

2. **No claim without a check.** If the page says a number, either it traces to
   the résumé or a link resolves to it. No exceptions, including in the README.

3. **Colour carries meaning.** `--signal` means "live right now". Never use it for
   decoration, emphasis, or a static link. Emphasis is scale and weight only.
   (ADR-001, ADR-002.)

4. **Comments explain the code, never the persuasion.** No comment anywhere may
   mention psychology, persuasion, conversion, recruiters, or AI assistance. The
   same file is read by Kushal and by an interviewer.

5. **No AI attribution.** No `Co-Authored-By`, no "generated with", not in files,
   not in commit messages.

6. **Prose gates.** Em-dash rate under 2 per 1,000 words. Banned vocabulary:
   delve, leverage, showcase, pivotal, robust, comprehensive, seamlessly,
   underscore, foster, tapestry, testament, intricate, vibrant.

7. **Degrade, never break.** A missing key, a blocked microphone, an exhausted
   free tier, a browser without WebGPU: each falls back to something that works
   and says so. Silence is the failure mode to avoid.

8. **Run `npm run build` before `npm run audit`.** 27 of the 97 checks grep the
   built CSS. Against a stale artifact they score the wrong thing.

9. **Work authorisation is answered, never volunteered.** `content/facts.md`
   holds the F-1 and OPT detail and the agent gives it accurately when asked.
   It is not rendered on the page and no section raises it unprompted. This was
   reviewed again on 2026-08-20 and deliberately kept: volunteering immigration
   status invites filtering that would not otherwise happen, and the agent
   already closes the question for anyone who actually asks it. Do not "fix"
   this by surfacing it.

---

## Commands

```
npm run dev            # dev server
npm run build          # production build
npm run audit          # 97 requirements, 12 domains
npm test               # unit + integration (43 tests total with system)
npm run test:all       # adds system tests against a production build
npm run test:evals     # 16 agent evals, asserts answer quality
npm run build:index    # rebuild retrieval index after editing facts.md
npm run build:graph    # recompute corpus graph edges
npm run verify:links   # HEAD-check every external URL
npm run check          # typecheck + lint:tokens + verify:facts
```

`.env.local` holds `NVIDIA_API_KEY`. Gitignored. Provider-dependent tests skip
cleanly without it rather than failing.

---

## Architecture, and why

**One app, one deploy.** The old site was Netlify plus a Render free-tier Python
backend whose cold start dominated every measurement. LangGraph JS in a Next
route handler removed it.

**Routed graph, not a chain.** `route` fans out to `retrieve → answer`, `deflect`,
or `handoff` on conditional edges. Four nodes, explainable in thirty seconds.

**No checkpointer.** LangGraph writes a checkpoint after every node; Postgres
saver measures 20–50ms per write with a known 6.79× serialisation overhead
(langgraph#7714). A 90-second demo does not need statefulness at that price.

**No vector database.** 16 chunks. In-memory float32 with brute-force cosine is
sub-millisecond; pgvector is 4–12ms p95 and Pinecone 20–40ms, all network. At
this corpus size a database is pure latency.

**Rank fusion, not score fusion.** BM25 is unbounded, cosine is bounded to
[-1,1]. Reciprocal rank fusion at k=60 avoids normalising two incomparable scales.

**Dense retrieval is skipped when lexical is decisive.** A rare term like
"Growaza" or "NCP-AAI" already isolates one chunk; the embedding round trip buys
nothing. Threshold 2.2× the runner-up.

**SSE, not WebSocket.** One-directional, request-scoped traffic. A socket adds
reconnect handling and an idle timeout on serverless to solve a problem this
shape does not have. `EventSource` also reconnects natively.

**Provider failover with cooldown.** Free tiers fail for a day, not a request. A
provider that 429s moves to the back for 15 minutes rather than being retried
first on every question, which was costing about two seconds of dead time.

**Motion loads after first paint, never before.** `lib/motion.ts` fetches GSAP
plus ScrollTrigger, SplitText and Flip on the first idle callback, waits for
`document.fonts.ready`, then sets `data-motion="js"` on the root, which stands
the CSS scroll timelines down. Those timelines stay in `globals.css` as the
floor: they are what Safari and a blocked script get. Under
`prefers-reduced-motion` nothing is requested at all. Every tween is a `from()`,
so nothing is ever hidden waiting for a script.

**Dark scheme is measured, not derived.** The light `color-mix` percentages do
not transfer to a dark ground; the same 76% mix put 14px labels at Lc 58 against
a target of 75. All four tokens and the three derived ones are restated in the
`prefers-color-scheme: dark` block from browser readings. `--signal` keeps its
hue and gives up chroma, because sRGB has no room for both at a lightness that
reads on near-black, and it is not text-grade there: Lc 61, so it fills the dot,
the progress rule and the focus ring while the words beside them are `--ink`.
Vendor hues on the credential wall sit at 25% against `--ink` for the same
reason, measured across all four issuers in both schemes.

---

## Ground truth

From the résumé PDF, 2026-08-09. Nothing on the site may contradict this.

**Kushal Gaddamwar** · Boston, MA · kushal7887pd@gmail.com · +1 (857) 328-4611
ORCID [0009-0009-9318-1616](https://orcid.org/0009-0009-9318-1616) ·
[github.com/Kushal9889](https://github.com/Kushal9889) ·
[linkedin.com/in/kushal-gaddamwar](https://linkedin.com/in/kushal-gaddamwar)

**Boston University, Questrom Computational Lab**: AI Engineer, Graduate
Researcher, May 2026 to present. Agentic RAG platform on Azure for an enterprise
consulting client. LangGraph agent, **14 tools**. Hybrid BM25 + vector, LLM query
rewriting, Cohere re-ranking. LLM-as-a-Judge evals. PII redaction. Header-aware
chunking, SHA-256 dedup. FastAPI SSE + React. Cosmos DB Gremlin knowledge graph.

**IMG Systems**: SWE Intern, Remote, Aug 2024 to Apr 2025. Apache Tika pipeline,
extraction accuracy **+20%**, **5,000+** profiles/month, screening time **−15%**.
Pydantic against JSON Schema, **95% schema accuracy** (from 75–78%). Docker,
PostgreSQL, Redis, REST latency **−25%**. GitHub Actions CI/CD.

**Growaza**: Associate SWE Intern, India, Jan to Jul 2024. API response
**−30%**, engagement **+22%**, **1,000+** DAU. MySQL dashboard, **2,000+** SKUs.
JWT + RBAC on AWS EC2/S3.

**BU Life AI**: Jan 2026 to present. LangGraph supervisor, **3** ReAct agents,
redundant LLM calls **−70%**. BM25 + NV-Embed 1024-dim over pgvector.
[Live](https://bulife-ai.netlify.app/) ·
[source](https://github.com/Kushal9889/BU-Life-AI)

**Education**: BU MSCS Sep 2025 to Dec 2026 · IIIT-DM Jabalpur B.Tech CSE 2020–24

**Publications**
- IEEE ICAICCIT 2024, first author, pp. 624–629.
  [doi:10.1109/ICAICCIT64383.2024.10912101](https://doi.org/10.1109/ICAICCIT64383.2024.10912101)
  Combined transformer + GNN **91.4%** accuracy; transformer alone 88.2%; GNN
  alone 85.7%. Detection+fix 13.5s against 25.4s for static analysis.
- IGI Global 2024, co-author, cyber-physical systems.

**Open source**: reported
[langchain-ai/deepagents#4846](https://github.com/langchain-ai/deepagents/issues/4846)
(19 Jul 2026, 15:20 UTC): `CompositeBackend.ls("/")` discarded default-backend
errors and returned a healthy-looking empty listing. Maintainer Mason Daugherty
(`mdrxy`) wrote and merged
[#4925](https://github.com/langchain-ai/deepagents/pull/4925) on 22 Jul at 00:45
UTC, **57 hours** later: 29 additions, 0 deletions, 2 files.

**He did not write the patch.** Never describe it as authored. He did offer to,
in the issue itself ("Happy to take this if the direction looks right"), so do
not claim he was unable to open a pull request either; that is false on a public
repo and the issue disproves it. Merging is what is org-restricted.

The PR body credits the handle, not the name: "Credit to @Kushal9889 for
reporting the issue and providing the reproduction." Do not upgrade this to
"credits him by name". The issue names **three** places the file already
contradicted itself, not four. All of these were wrong on the site until
16 Aug 2026 and are checkable by anyone who opens the links.

**Certifications**: NVIDIA NCP-AAI 2026
([Credly](https://www.credly.com/badges/c8f105aa-1815-40cc-85a1-e5a2ef20c920/public_url),
proctored) · AWS Cloud Technical Essentials
([verify 4L1ZWS6VK2L8](https://www.coursera.org/account/accomplishments/verify/4L1ZWS6VK2L8)) ·
Google Cloud Fundamentals
([verify T3SB0BFWGHI8](https://www.coursera.org/account/accomplishments/verify/T3SB0BFWGHI8)) ·
IBM RAG and Agentic AI, **3 of 10** courses verified
(YDOJ7MYNJPRF, D6YEX1E4M9GC, 9S7Z4CGK7EB5)

**Achievements**: JEE Mains 99.1 percentile of 1.2M (**top 0.9%**) · CodeChef
global rank 64, Feb 2022 · co-founded BITBYTE, 70+ members · Advisory Head,
Tarang Fest 2023, 13 colleges, $12,000 raised

### Claims permanently dropped

Do not reintroduce. Each was on the old site or old README and contradicts the
résumé or is unverifiable.

`agents_active: 3` · `cache_hit_rate: 67` · "top 0.08%" (99.1 percentile is top
0.9%) · "5,247 profiles/month" (false precision; it is 5,000+) · Kubernetes (it
is Docker) · D3.js (it is MySQL) · "98% data accuracy" · "cut manual review 70%" ·
IMG Systems located in Boston (it is Remote) · "shipping since GPT-3.5" · "3
features ahead of schedule" · "in conversations with frontier AI labs" · EST
project (not started) · LLM Mesh (not built)

---

## Research, inline

Gathered across this session. Do not re-run these searches.

## Research, inline

The persuasion, anti-slop and hiring research this site was built from lives in
`NOTES.private.md`, which is gitignored. It is not in the public repo on purpose:
it is a study of the person reading the page, and a reader who finds it stops
reading the page and starts reading the study. Nothing in it is needed to work on
the code; everything that constrains the code is already a hard rule above or a
check in `scripts/audit.ts`.

## Defects fixed here, with the test that guards each

Do not reintroduce. Each has a test.

| Defect | Guard |
|---|---|
| Reasoning model leaked its chain-of-thought and the system prompt into answers | `unit.test.ts` → cleanAnswer |
| Streaming shipped with `usage: null` hardcoded; tokens never displayed | `integration.test.ts` → reports token usage |
| `streamUsage: true` missing, so LangChain never attached `usage_metadata` | same |
| Work-authorisation matcher missed "authorized to work" | `unit.test.ts` → both word orders |
| Neural TTS awaited an 86MB download before any sound | `speak()` starts built-in immediately |
| Blocked microphone failed silently, looked like a broken agent | visible `micError` state |
| Sticky 260vh scroll track failed to paint under compositing | replaced with per-element `view()` |
| Agent lived only at the page bottom, below the fold | rendered inside `Hero` |
| JSON-LD test did not handle `@graph` nesting | test fixed, site was correct |
| Diagonal hatch used `repeating-linear-gradient`, tripping the no-gradients rule | audit check 2.5, blocking |
| Colour linter walked `.netlify/static`, where tokens are already compiled to hex | `SKIP_DIRS` in `lint-tokens.ts` |
| `Prose` had no inline-code mark, so three identifiers printed their own backticks | `code` token in `Prose.tsx` |
| ScrollTrigger built its triggers before webfonts laid the page out, so below-fold elements measured as already entered and spent their entrance off-screen | `await document.fonts.ready` in `lib/motion.ts` before the kit resolves |
| `once: true` destroyed a trigger on that early enter, so the reveal could never play | played `WeakSet` in `PageMotion.tsx`, no `once` |
| `gsap.context(fn, scope)` rewrites selector strings to the scope, and the scope was an empty node, so `toArray` silently matched nothing | `document.querySelectorAll` in `PageMotion.tsx` |
| `profile.site` pointed at a Vercel address that is not this site, feeding the canonical tag, `metadataBase`, JSON-LD and the share image | corrected in `content/facts.md`; note `verify:links` skips the self URL by design, so nothing tested it |

## Claims that were wrong until 16 Aug 2026

All four were on the open-source section and all four are checkable by anyone
who opens the links. Do not reintroduce.

| Was | Is |
|---|---|
| "3 days" from report to merge | **57 hours** (19 Jul 15:20 UTC to 22 Jul 00:45 UTC) |
| PR "credits him by name: Kushal Gaddamwar" | credits the handle only: "Credit to @Kushal9889 for reporting the issue and providing the reproduction" |
| "4 code paths shown to disagree" | the issue names **three** |
| "could not open the pull request himself" | he offered to write it in the issue; **merging** is what is org-restricted |

---

## v8, 10 Aug: the matrix

The corpus ring draws only pairs that share a technology, which left 7 of the 15
possible pairs invisible. `CorpusMatrix` puts all six nodes on both axes and
scores every cell by shared-technology count, so an empty cell is a reading
rather than a gap: IMG Systems and BU Life AI have no technology in common, and
that is a fact about the work.

The diagonal counts a node's own stack and is marked rather than scored, so it
never reads as the strongest cell in its row.

**Both components ship.** The ring shows shape at a glance; the matrix shows
every pair including the empty ones. Neither is redundant.

## Known limits, stated plainly

- **"Top 0.001%" has no test.** What is measurable: 97/97 audit requirements,
  43/43 tests, 15/15 links live, 16/16 evals at p50 1.4s, 0 machine-made signals,
  0 claims contradicted by the résumé.
- **v1–v6 in the plan file were reconstructed from commits after the fact.** The
  decisions are real; the boundaries between versions were drawn retrospectively.
- **The audit passed 97/97 while tokens were silently null.** Audits check the
  questions you thought to ask. Tests that encode real failures caught what the
  audit missed.

---

## Live

Both URLs serve the same build.

- **https://kushal-portfolio-223.netlify.app** is the address printed on the
  résumé, so this is the one that matters. It served the old site until 10 Aug.
- **https://kushal-portfolio-v2.netlify.app** is the same deploy under the repo's
  own name.
- Source: **https://github.com/Kushal9889/kushal-portfolio-v2**

Deploying: `netlify deploy --prod --build` from this directory. The CLI is linked
to `kushal-portfolio-223`; check with `netlify status` before deploying, because
`netlify link --id` has silently failed here and left the CLI pointed at the
wrong site. Env vars set while mislinked land on the wrong project.

The first deploy attempt reported exit 0 having only built, never uploading.
Verify a route rather than trusting the exit code:

```
curl -sL -o /dev/null -w "%{http_code}\n" https://kushal-portfolio-223.netlify.app/llms.txt
```

## Open, needs credentials this session did not hold

1. **Rotate `NVIDIA_API_KEY`.** It is set on two public Netlify sites and was
   pasted into a chat transcript. Treat it as compromised. After rotating:
   `netlify env:set NVIDIA_API_KEY <new>` on both projects, then redeploy.
2. **Connect ORCID** `0009-0009-9318-1616` at `github.com/settings/profile` so
   GitHub renders the verified iD. Needs the `user` scope.
3. **Set the profile blog field** to the portfolio URL. Currently empty.
4. **Add the IEEE paper to the ORCID record.** It lists only the IGI chapter, so
   the verified record is missing the stronger publication.
5. **Decide the old repo.** `Kushal9889/kushal-portfolio` still holds the previous
   portfolio and its history back to May. A force-push over it was approved but
   blocked by the permission classifier, so v2 went to a new repo instead. Old
   history is bundled at `~/kushal-portfolio-old-history-20260810.bundle`.
