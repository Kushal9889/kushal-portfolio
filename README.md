# kushalgaddamwar.com

Personal site with an agent that answers questions about my work, grounded in a
single corpus file and running on a LangGraph state machine.

Everything on the page is either measured or linked to a source that can be
checked. There are no placeholder numbers.

---

## Run it

```bash
npm install
npm run build:index
npm run dev
```

Works with no API key: retrieval falls back to keyword-only and the agent returns
the retrieved section directly instead of a generated answer. Add a key to get
generated answers.

```bash
cp .env.example .env.local
```

## Providers

One env var switches production. OpenRouter, NVIDIA NIM and OpenAI are all
OpenAI-compatible, so they run through the same LangChain `ChatOpenAI` client
with a different `baseURL`.

```bash
LLM_PROVIDER=openrouter          # default
LLM_PROVIDER=nvidia              # free NIM credits, also serves embeddings
LLM_PROVIDER=openai              # add OPENAI_API_KEY
```

Unset keys degrade rather than error. Configured providers are tried in order, so
a free tier hitting its daily cap produces a slower answer rather than none.

## How it works

```
question
   │
   ▼
route ──────────────────────────────────────────────┐
   │ keyword classification, no model call          │
   ├─ answer ──▶ retrieve ──▶ answer ──▶ END        │
   ├─ handoff ─▶ retrieve ──▶ answer ──▶ END        │  intent to hire
   ├─ authorisation ──────────────────▶ END         │  fixed text
   └─ deflect ────────────────────────▶ END         │  compensation, personal
```

**route** classifies by keyword. Deterministic, free, and adds nothing to the
latency a visitor waits on.

**retrieve** fuses BM25 with cosine over vectors baked into the bundle at build
time, merged by reciprocal rank fusion. The corpus is 16 chunks, so a vector
database would be pure network tax. When one rare term already picks out a chunk
decisively, the embedding call is skipped entirely.

**answer** streams tokens over Server-Sent Events. No checkpointer: LangGraph
writes one after every node by default, which is 20–50ms per write for
statefulness a stateless question does not need.

## Content

`content/facts.md` is the only source of truth. It feeds the rendered page, the
retrieval index, `llms.txt`, and the share card. A claim that is not in that file
cannot appear on the site.

- `@metric value | label` lines are lifted out of prose into the figures strip.
- `**bold**` marks the one sentence per section worth stopping on.
- `[text](url)` and bare URLs both render as links.

`content/certifications.json` holds credentials. A course with a `url` counts as
earned; the progress count is derived from that rather than hand-maintained.

## Checks

```bash
npm run check          # typecheck + lint:tokens + verify:facts
npm run verify:links   # every external URL, HEAD then ranged GET
npm run test:evals     # 16 questions against the live agent
```

`lint:tokens` fails on any colour outside `app/globals.css`.
`verify:facts` fails if a required section is missing, a credential has no
verification link, or the em-dash rate rises above 2 per 1,000 words.

## Deploy

Push to GitHub, import the repo on Vercel, set `NVIDIA_API_KEY`. Nothing else.

CI runs typecheck, token lint, fact verification, index rebuild and a production
build on every push. Link checking runs as a separate non-blocking job, because a
credential host being briefly unreachable should be visible without blocking a
deploy.

## Voice

Speech recognition uses the browser's built-in Web Speech API. Speech synthesis
tries Kokoro-82M over WebGPU first, an on-device neural model that costs nothing
per minute and sends no audio anywhere, and falls back to the built-in
synthesiser where WebGPU is unavailable. The model is fetched on the first spoken
answer, never on page load.

Audio needs a user gesture. Browsers do not accept scrolling as one, so nothing
here promises audio before a click, and a blocked microphone says so rather than
failing silently.

## Layout

```
app/
  page.tsx              sections composed, no logic
  api/agent/            settled answer, used by evals and the hero trace
  api/agent/stream/     SSE token stream, used by the visitor-facing agent
lib/agent/
  graph.ts              the StateGraph
  model.ts              provider selection and failover
  retrieve.ts           BM25 + cosine + RRF over the baked index
  policy.ts             routing, refusals, system prompt, answer cleanup
lib/voice/              speech in and out
content/                facts.md and certifications.json
scripts/                index build and the verification gates
docs/                   ADRs and the research this was built from
```

## Docs

- `docs/adr-001-visual-hierarchy.md` — why metrics are pulled out of prose
- `docs/adr-002-emphasis-and-placement.md` — emphasis marks, agent placement, motion
- `docs/research/00-findings-to-build-map.md` — every research finding and where it landed
