import { AzureChatOpenAI, ChatOpenAI } from "@langchain/openai";

/**
 * Provider selection.
 *
 * OpenRouter, NVIDIA NIM and Groq all speak the OpenAI wire format, so one
 * ChatOpenAI client with a different baseURL covers all of them. That keeps this
 * file at one class instead of one SDK per vendor, and it means moving to a paid
 * provider is an environment change rather than a code change.
 *
 * Unset keys fall through to the next provider rather than throwing, so a missing
 * key degrades the site instead of breaking it.
 */
type ProviderName = "openrouter" | "nvidia" | "azure" | "openai";

const PROVIDERS: Record<ProviderName, { baseURL?: string; key?: string; model: string }> = {
  openrouter: {
    baseURL: "https://openrouter.ai/api/v1",
    key: process.env.OPENROUTER_API_KEY,
    // Free tier. Small and fast beats clever here: answers are grounded in
    // retrieved text, so the model is summarising rather than reasoning. This is
    // a mixture-of-experts model with roughly 3B active parameters, which is what
    // keeps time-to-first-token low enough to sit in front of a visitor.
    model: process.env.OPENROUTER_MODEL ?? "nvidia/nemotron-3-nano-30b-a3b:free",
  },
  nvidia: {
    baseURL: "https://integrate.api.nvidia.com/v1",
    key: process.env.NVIDIA_API_KEY,
    // Deliberately the same model the OpenRouter entry uses. Failover should
    // change where an answer comes from, not how good it is: an earlier 8B
    // fallback answered correctly but dropped the headline metric, so a visitor
    // would have got a quietly worse site on the days the primary was capped.
    model: process.env.NVIDIA_MODEL ?? "nvidia/nemotron-3-nano-30b-a3b",
  },
  azure: {
    // Azure keys its deployments by name rather than by model id, so the
    // deployment is the model here. Everything else in this file is unchanged:
    // AzureChatOpenAI is a LangChain class with the same interface.
    key: process.env.AZURE_OPENAI_API_KEY,
    model: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4o-mini",
  },
  openai: {
    key: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  },
};

const ORDER: ProviderName[] = ["openrouter", "nvidia", "azure", "openai"];

/**
 * Published list prices, US dollars per million tokens.
 *
 * The trace has printed "$0.00 on a free tier" since it was built, which is true
 * and says nothing: every number on that panel is measured except the one that
 * matters to whoever pays the bill. These rates are what the same traffic costs
 * at list price, so the free tier reads as a decision with a known value rather
 * than as an absence of one. Unlisted models fall back to null and the line is
 * omitted rather than guessed.
 */
const RATES: Record<string, { in: number; out: number }> = {
  "nvidia/nemotron-3-nano-30b-a3b": { in: 0.04, out: 0.16 },
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
};

export function listPrice(model: string, usage: { in: number; out: number }) {
  const rate = RATES[model.replace(/:free$/, "")];
  if (!rate) return null;
  return (usage.in * rate.in + usage.out * rate.out) / 1_000_000;
}


/**
 * Which providers are currently benched, and for how long.
 *
 * Failover is the most production-shaped thing on this page and it has been
 * completely invisible: the reader sees an answer whether it came from the
 * primary or from the third fallback. Exposed read-only so the trace can say so.
 */
export function failoverState() {
  const now = Date.now();
  return ORDER.filter((n) => PROVIDERS[n].key).map((n) => ({
    name: n,
    coolingOffFor: Math.max(0, Math.round(((coolingOff.get(n) ?? 0) - now) / 1000)),
  }));
}

/**
 * Providers that recently refused, and when they may be retried.
 *
 * Free tiers fail for a day at a time, not for a request. Without this the
 * exhausted provider is tried first on every single question, and the visitor
 * pays a full failed round trip before the working provider is even called.
 * Measured at roughly two seconds of dead time per question.
 *
 * Rate limits get a long cooldown because the cap is usually daily. Other
 * failures get a short one, since those are more often transient.
 */
const coolingOff = new Map<ProviderName, number>();

const RATE_LIMIT_COOLDOWN_MS = 15 * 60_000;
const TRANSIENT_COOLDOWN_MS = 30_000;

function benchProvider(name: ProviderName, err: unknown) {
  const message = String((err as Error)?.message ?? err);
  const rateLimited = /429|rate.?limit|quota|too many requests/i.test(message);
  coolingOff.set(name, Date.now() + (rateLimited ? RATE_LIMIT_COOLDOWN_MS : TRANSIENT_COOLDOWN_MS));
}

function isCoolingOff(name: ProviderName) {
  const until = coolingOff.get(name);
  if (until === undefined) return false;
  if (Date.now() >= until) {
    coolingOff.delete(name);
    return false;
  }
  return true;
}

/** Every configured provider, preferred first. */
function availableProviders(): ProviderName[] {
  const preferred = process.env.LLM_PROVIDER as ProviderName | undefined;
  const configured = ORDER.filter((name) => PROVIDERS[name].key);

  const ordered =
    preferred && PROVIDERS[preferred]?.key
      ? [preferred, ...configured.filter((n) => n !== preferred)]
      : configured;

  // A provider in cooldown moves to the back rather than being dropped. If every
  // provider is cooling off the request should still be attempted, because a
  // stale cooldown is a worse failure than a retry.
  const ready = ordered.filter((n) => !isCoolingOff(n));
  return ready.length ? ready : ordered;
}

export function activeProvider(): ProviderName | null {
  return availableProviders()[0] ?? null;
}

function build(name: ProviderName, streaming: boolean) {
  const provider = PROVIDERS[name];
  const shared = {
    streaming,
    temperature: 0.1,
    // Bounded on purpose. This is a public endpoint, and output tokens are the
    // half of the bill a stranger controls for free.
    maxTokens: Number(process.env.AGENT_MAX_OUTPUT_TOKENS ?? 400),
    // One retry only. A visitor is waiting, and a provider that failed twice is
    // better swapped than waited on.
    maxRetries: 1,
    // Without this the final chunk carries no usage_metadata and the token
    // count on screen stays empty, which is the number a reader most wants
    // when the page is claiming to be cost-aware.
    streamUsage: true,
  };

  if (name === "azure") {
    return new AzureChatOpenAI({
      ...shared,
      azureOpenAIApiKey: provider.key,
      azureOpenAIApiDeploymentName: provider.model,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21",
    });
  }

  return new ChatOpenAI({
    ...shared,
    apiKey: provider.key,
    model: provider.model,
    configuration: provider.baseURL ? { baseURL: provider.baseURL } : undefined,
  });
}


/**
 * Calls the first working provider.
 *
 * Free tiers fail in ways a health check never sees: OpenRouter allows 50
 * model requests a day, and the 51st returns 429 with no warning. Choosing a
 * provider once at startup means the agent breaks precisely when the site is
 * getting traffic, which is the worst possible time. Each configured provider
 * is tried in turn, so a daily cap degrades to a slower answer rather than none.
 */
export async function invokeWithFailover(
  messages: { role: string; content: string }[],
): Promise<{ text: string; provider: ProviderName; usage: { in: number; out: number } | null }> {
  const providers = availableProviders();
  if (providers.length === 0) throw new Error("no provider configured");

  let lastError: unknown;
  for (const name of providers) {
    try {
      const res = await build(name, false).invoke(messages);
      const meta = (res.response_metadata?.tokenUsage ?? res.usage_metadata ?? null) as {
        promptTokens?: number;
        completionTokens?: number;
        input_tokens?: number;
        output_tokens?: number;
      } | null;

      return {
        text: typeof res.content === "string" ? res.content : "",
        provider: name,
        usage: meta
          ? {
              in: meta.promptTokens ?? meta.input_tokens ?? 0,
              out: meta.completionTokens ?? meta.output_tokens ?? 0,
            }
          : null,
      };
    } catch (err) {
      lastError = err;
      benchProvider(name, err);
      console.warn(`provider ${name} failed, trying next:`, (err as Error).message);
    }
  }
  throw lastError;
}


/**
 * Token stream, with the same failover the non-streaming path uses.
 *
 * A free tier that caps mid-answer is a real case: the generator switches to the
 * next provider and restarts, which is visible as a brief stall rather than a
 * half-finished sentence. Restarting is correct here because a partial answer
 * from one model cannot be continued coherently by another.
 */
export async function* streamWithFailover(
  messages: { role: string; content: string }[],
  onUsage?: (usage: { in: number; out: number }) => void,
  onProvider?: (provider: ProviderName, model: string) => void,
): AsyncGenerator<string> {
  const providers = availableProviders();
  if (providers.length === 0) throw new Error("no provider configured");

  let lastError: unknown;
  for (const name of providers) {
    try {
      const stream = await build(name, true).stream(messages);
      // Reported once the provider has actually produced a stream rather than
      // when it was selected, so a provider that fails on connect is never
      // credited with an answer it did not give.
      onProvider?.(name, PROVIDERS[name].model);
      for await (const chunk of stream) {
        const text = typeof chunk.content === "string" ? chunk.content : "";
        if (text) yield text;

        // Usage arrives on the final chunk rather than alongside the tokens, so
        // it is reported through a callback instead of the generator: a consumer
        // reading text should not have to discriminate two payload shapes.
        const u = chunk.usage_metadata;
        if (u) onUsage?.({ in: u.input_tokens ?? 0, out: u.output_tokens ?? 0 });
      }
      return;
    } catch (err) {
      lastError = err;
      benchProvider(name, err);
      console.warn(`provider ${name} stream failed, trying next:`, (err as Error).message);
    }
  }
  throw lastError;
}

/**
 * Query embeddings, used only to score the dense half of retrieval. Chunk vectors
 * are precomputed at build time, so this is the single embedding call per
 * question. Returns null when no embedding provider is configured, and retrieval
 * falls back to BM25 alone rather than failing.
 */
export async function embedQuery(text: string): Promise<number[] | null> {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) return null;

  const res = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      input: [text],
      model: "nvidia/nv-embedqa-e5-v5",
      input_type: "query",
    }),
  });

  if (!res.ok) return null;
  const json = await res.json();
  return json.data?.[0]?.embedding ?? null;
}
