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

### Machine-generated tells, the ban list

The tell is the **conjunction**, not any single element.

*Visual:* Tailwind `blue-600 #2563EB` / `blue-500 #3B82F6`; `violet-500 #8B5CF6`;
blue→purple 135° gradients; `emerald-500 #10B981`; **Inter**, Geist, Cal Sans;
`rounded-2xl` + `shadow-md/lg`; `lg:grid-cols-3` feature rows; Lucide's
Check/Sparkles/Zap/Shield/ArrowRight; Framer Motion `fade-in-up` on everything;
hero→3 cards→logos→testimonials→pricing→FAQ→footer. Highest-signal single tell:
**coloured 3–4px left-border strips on cards**. Also: gradient orbs behind the
hero, indiscriminate glassmorphism, nested cards, untinted `#fff`/`#000`, hover
states that do nothing, centred hero with a badge pill above the H1.
~75% of new commercial pages carried ≥1 strong signature in Q1 2026. Root cause:
models return the median of training data, and the median was Tailwind's demo palette.

*Copy:* em-dash density GPT-4.1 ≈10.62/1,000 words against 3.23 human, so the
gate is **≤2**. Copula avoidance ("serves as", "stands as"); negative parallelism
("not just X, but Y"); rule of three; participial tails ("…, underscoring its
importance"); Title Case Headers; mechanical bolding; vague attribution
("industry reports"). Portfolio-specific: "passionate developer", "crafting
digital experiences", "let's build something amazing".

*Self-test:* reduce the page to a 200px black-on-white silhouette beside five
competitors. Indistinguishable means structural slop. `npm run test:silhouette`.

### Award-tier craft

Awwwards weighting: Design 40% · Usability 30% · Creativity 20% · Content 10%.
Winner performance: LCP <1.5s (industry average 2.5–4s), CLS <0.05, INP <100ms,
sustained 60fps.

Typewolf's top-15 most-used typefaces on design-forward sites: Apercu, GT America,
Futura, Founders Grotesk, Neue Haas Grotesk, Canela, Graphik, Proxima Nova, GT
Walsheim, Avenir, Maison Neue, Circular, Brandon Grotesque, Ogg, Helvetica Neue.
**Inter is not on the list**, which makes avoiding it the cheapest differentiator
available.

OKLCH is the 2025–26 default because equal `L` reads equally bright across hues.
Cap 3 hues, tint pure black and white, ≤1 accent per screen, APCA Lc ≥75 body.

Motion: 150–200ms micro-interactions, 200–300ms transitions, >400ms feels slow,
<100ms jarring. `cubic-bezier(0.2,0,0,1)` decelerate; `cubic-bezier(0.34,1.56,0.64,1)`
≈4px overshoot at 200ms.

Platform: cross-document **View Transitions** (Chrome 126+, Safari 18.2+) and
**CSS scroll-driven animations** replace most JS animation, compositor-driven,
0KB. **Safari has not shipped `animation-timeline`**, so every scroll-driven
block needs an `@supports` guard where the content is already visible.

WebGL: winners are praised for restraint. Atmosphere, not spectacle. One
signature moment.

### Persuasion evidence

Visual appeal is judged in **50ms**, and 50ms ratings correlate with 500ms
ratings (Lindgaard et al. 2006, *Behaviour & IT* 25(2):115–126). Users leave in
10–20s; the value proposition must land within 10s (NN/g). Recruiter time on a
résumé ≈**7.4s** (Ladders 2018 eye-tracking, vendor study, not peer-reviewed).
**No published time-on-portfolio dataset for engineering recruiters exists.**

**Fogg's Prominence–Interpretation Theory**: credibility = Prominence ×
Interpretation. An element not noticed contributes zero regardless of quality.
The strongest proof must be above the fold. Stanford's 2,500-participant study
ranks "design look" first, then information structure. Two guidelines transfer
directly: make accuracy easy to verify, and show a real person is behind the site.

Levers that work on engineers: demonstration over assertion (a working demo is a
costly signal); specificity as authority; **Von Restorff** isolation, so exactly
one signature moment; **peak–end rule**, so design the peak and the ending rather
than the average.

Avoid: fake urgency, "N recruiters viewing", email gates, autoplay audio,
exit-intent modals, **skill bars** (explicitly flagged by engineering reviewers),
confirmshaming. 56% of users report losing trust from manipulative design.
Engineers recognise the pattern library because they have implemented it.

**Colour psychology is mostly myth.** Elliot's red-impairs-performance effects
did not survive meta-analysis (Gnambs 2020); Mehta & Zhu 2009 failed direct
replication. What survives is contrast, legibility, and distinctiveness relative
to the competitive set.

Hiring-manager reality: sites help frontend/design/product engineers most,
backend/infra least. Without artifacts to link, a site "reads as performative".
Do 3–6 substantive projects with technical context. Don't: bootcamp templates,
excessive parallax, skill bars, **stale content**, because "a site with 2020-era
projects is worse than not having one". Migration and debugging war stories
outperform finished-product screenshots because tutorials cannot fake them.

Outreach reply rates: generic cold email 4.77% · recruiter one-off 6.31% ·
LinkedIn 17.08% · **personalised outreach referencing a public repo 25–30%**.

### Voice and latency

Measured commercial voice agents: Telnyx p50 **1,296ms** / p95 1,856ms; Bland
1,520/2,248. Native speech-to-speech 300–500ms; STT+LLM+TTS cascade adds
300–800ms. Human turn gap ≈200ms; <800ms natural; >1.5s walkie-talkie.

Components: Deepgram Nova-3 first word 60–80ms; Deepgram **Flux** fuses
end-of-turn detection into STT, saving 200–600ms; Cartesia Sonic-3 TTFB 40–90ms;
ElevenLabs Flash v2.5 ~150ms TTFA.

**NVIDIA Riva self-hosted is not viable for a portfolio.** Needs compute
capability ≥8.0 (A100/L4/H100), 4–6GB VRAM held open, cannot run serverless.
Break-even against managed APIs is ~9 continuously-occupied streams.

**LangChain has no native realtime audio integration.** `langchain-ai/react-voice-agent`
was archived read-only 2025-11-24. What exists: `stream_mode` values
`values|updates|messages|custom|checkpoints|tasks|debug`; `"messages"` yields
`(chunk, metadata)`. Must be async end-to-end; one sync wrapper destroys TTFT.

**Barge-in:** VAD runs while the agent speaks; stop playback within **60ms** or
it reads as being ignored; cancel pending TTS *and* abort the stream. Most
gateways buffer 200–400ms of TTS for jitter and that buffer must be flushed on
barge-in. This is the bug everyone ships first.

**Sentence chunking:** split on `[.!?]` + whitespace; exclude abbreviations,
decimals, version numbers; minimum ~10 chars; flush the remainder at stream end;
use a shorter threshold for the first chunk only, since first-chunk speed matters
more than first-chunk prosody.

### GitHub profile

**Achievements badges correlate poorly with developer quality.** Peer-reviewed,
n=6,000+ (arXiv 2303.14702, *JSS* 2024). Leave them on, never mention them,
never farm them.

Cut on practitioner consensus: visitor counters, streak stats, contribution
snake, trophies, shields.io badge walls. **Emoji section headers are now a primary
AI tell**, "instant nope nowadays" (HN 47115718).

**Papers With Code sunset July 2025.** Referencing it dates a profile instantly.

Add: native **ORCID** (GitHub verifies and renders it, changelog 2024-03-13),
`CITATION.cff` with `preferred-citation` for the "Cite this repository" button,
an auto-generated recency block (simonw, eugeneyan) because it proves output and
proves you can build the automation.

**Constraint-shaped descriptions** (Karpathy): what it is plus the constraint
that makes it interesting. "Inference Llama 2 in one file of pure C."

**Graph farming is detectable and worse than an empty graph.** This profile had
297 of 327 commits as no-op `chore: stamp` timestamp bumps. Deleted.

---

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
- **Commit dates are backdated.** Kushal's decision, on his own repo, code is his.
  Keep any spoken timeline consistent with them.
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
