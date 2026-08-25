import { loadContent } from "../content";
import { nearestTerm } from "./vocab";

/** Heading words too generic to mark a question as being about one section. */
const STOP = new Set([
  "what", "does", "this", "site", "page", "work", "works", "open", "source",
  "defects", "shipped", "then", "fixed", "retrieval", "good", "about", "how",
  "authorisation", "publications", "skills", "education", "availability",
]);

const { profile, sections } = loadContent();

/**
 * Distinctive words from the section headings: "Growaza", "Questrom", "IMG".
 *
 * A question that names one of these is asking about that thing, whatever verb
 * it uses. Without this, "What did he do at IMG Systems?" was read as a general
 * work question and the weights pushed his current role above the employer he
 * had actually been asked about -- the ranking overruling the reader.
 *
 * Built from the corpus, so a new section is covered the moment it is written.
 * Short and common words are dropped because a heading like "This site" would
 * otherwise make every question specific.
 */
const NAMED = new Set(
  sections
    .flatMap((s) => s.title.toLowerCase().split(/[^a-z0-9+#.-]+/))
    .filter((w) => w.length > 3 && !STOP.has(w)),
);

function namesASection(question: string): boolean {
  return question
    .toLowerCase()
    .split(/[^a-z0-9+#.-]+/)
    .some((w) => {
      if (w.length <= 3) return false;
      if (NAMED.has(w)) return true;
      // "IMG Sytems" defeated this check, so the question was reclassified from
      // `specific` to `shipped` and the weights then promoted his current role
      // over the employer he had been asked about. A typo must not be able to
      // change what the question is about.
      const near = nearestTerm(w);
      return near ? NAMED.has(near) : false;
    });
}

/**
 * What the question is actually asking, decided before anything is retrieved.
 *
 * Retrieval on a corpus this small is decided by a handful of terms, and a
 * handful of terms is not enough to tell "what did he ship" from "what does
 * this page ship". Measured, that exact collision shipped: "What did he ship?"
 * survives stopword removal as the single token "ship", the only chunk
 * containing that token is the section describing this website -- because it
 * says the page refuses to "ship claims it cannot support" -- and the agent
 * answered a question about a career with a paragraph about Netlify.
 *
 * No amount of prompt wording fixes that, because the right section never
 * reaches the prompt. So the question is classified first, expanded into the
 * vocabulary the corpus actually uses, and the ranking is then weighted by what
 * kind of section can answer that kind of question. Each of the three is cheap,
 * deterministic, and costs no network call.
 */
export type Intent = "identity" | "shipped" | "limitation" | "system" | "specific";

/** The signals `scripts/build-index.ts` lifts out of each section at build time. */
export type ChunkMeta = {
  fromNotes: boolean;
  dated: boolean;
  current: boolean;
  year: number;
  metrics: number;
  artifacts: number;
};

export type Analysis = {
  intent: Intent;
  /** What the retrievers score. May be wider than what the reader typed. */
  query: string;
  /** Multiplier on a chunk's fused score. 1 leaves the ranking untouched. */
  weight: (meta: ChunkMeta | undefined) => number;
  /**
   * The question as the model should receive it.
   *
   * "Tell me about yourself" is addressed to the assistant, and the assistant
   * answered it: "I am Kushal Gaddamwar, an AI Engineer at ...". Every rule in
   * the system prompt says third person and the model followed the pronoun in
   * the question instead, which is the stronger signal and always will be.
   *
   * Fixed by changing who is being asked rather than by adding a fourth
   * instruction telling it not to. The reader still sees what they typed; only
   * the model sees this.
   */
  asked: string;
  /**
   * How far below the leader a chunk may score and still reach the model.
   *
   * Overridden for one intent. "Does he know PyTorch?" matches a single chunk
   * lexically -- the section listing what he does not do -- so that chunk
   * carries both retrievers and scores 1/61 + 1/62, while every other chunk
   * carries dense only and scores 1/62. The ratio is 0.49, the default floor is
   * 0.55, and the model was handed a context containing nothing he has done and
   * an instruction to name something he has done. It invented one, and what it
   * reached for was the other half of the sentence denying PyTorch.
   *
   * A limitation question structurally needs both halves, so it gets a lower
   * floor rather than a longer prompt.
   */
  floor?: number;
};

const IDENTITY =
  /^\s*(?:so\s+)?(?:tell me (?:a bit )?about (?:yourself|him|himself|kushal)|who (?:is|are) (?:he|you|kushal)|introduce (?:yourself|him)|walk me through (?:his|your) background|what should i know about (?:him|kushal)|give me (?:a |the )?(?:quick |short )?(?:intro|introduction|overview|summary|rundown)|his background|about (?:him|yourself))\b/i;

/** Asking what he has done, in any of the ways people ask it. */
const SHIPPED =
  /\b(ship(?:ped|s)?|built|build(?:s|ing)?|deliver(?:ed|s)?|launch(?:ed|es)?|work(?:ed|ing)? on|working on right now|experience|projects?|portfolio of work|track record|what has he done|what did he do|where has he worked|his roles?|his jobs?)\b/i;

/** Asking about this page, this agent, or how it works. */
const SYSTEM =
  /\b(this (?:page|site|website|agent|demo|thing)|your (?:retrieval|agent|prompt|graph|stack|architecture))\b|\bhow (?:does|do) (?:this|it|the (?:retrieval|agent|graph|routing|fusion))\b/i;

/** Asking whether he can do a specific thing, which may be a no. */
/*
 * Asking whether he can do a specific thing, which may be a no.
 *
 * Narrower than it first looked. The first version accepted "did he do", which
 * classified "What did he do at IMG Systems?" as a limitation question and
 * weighted the ranking towards capability sections on a question about a
 * specific job. A limitation question names a skill, not a place, so the verb
 * has to be one of knowing or using rather than the general "do".
 */
const LIMITATION =
  /\b(?:does|can|has|did) (?:he|kushal) (?:know|use[sd]?|used|work(?:ed)? with|have any|ever)\b|\bis (?:he|kushal) (?:a|an) \w+/i;

const NEUTRAL = () => 1;

/**
 * Ranking weights, one set per intent.
 *
 * Deliberately gentle. These multiply a fused rank score, so a strong lexical
 * or dense match still wins; the weights break ties and demote sections that
 * are structurally wrong for the question. A weight large enough to override
 * the retrievers would be a hand-written ranking wearing a retriever's clothes.
 */
const WEIGHTS: Record<Intent, (m: ChunkMeta | undefined) => number> = {
  /*
   * Work questions want dated roles and measured outcomes, most recent first,
   * and they do not want the page describing itself. The current role is
   * boosted hardest because "what does he do" is present tense: a reader asking
   * it is asking what he is doing now, not what he did in 2024.
   */
  shipped: (m) => {
    if (!m) return 1;
    let w = 1;
    if (m.dated) w += 0.3;
    if (m.current) w += 0.35;
    else if (m.year >= 2025) w += 0.15;
    if (m.metrics > 0) w += 0.2;
    if (m.artifacts > 0) w += 0.1;
    if (m.fromNotes) w -= 0.35;
    return w;
  },

  /* The mirror image: a question about this page wants the pages about it. */
  system: (m) => (!m ? 1 : m.fromNotes ? 1.45 : m.dated ? 0.75 : 1),

  /*
   * A limitation question needs both halves in context, and needs no reranking
   * at all to get them.
   *
   * Asked "Does he know PyTorch?" retrieval returned one chunk -- the section
   * listing what he does not do -- and the model, told to answer No and then
   * name the nearest thing he has done, invented one from the other half of the
   * sentence denying PyTorch. The fix was to admit more context, and the first
   * attempt did it twice: it lowered the relevance floor *and* weighted
   * capability sections up by 1.15.
   *
   * The weight was wrong and measurably so. "What he does not do" ranks first
   * in both retrievers on that question -- lexical rank 1, dense rank 1, which
   * is as unambiguous as this corpus gets -- and the multiplier promoted IMG
   * Systems past it from lexical rank 9. Precision@1 across the benchmark fell
   * from 1.00 to 0.87, both losses on limitation questions.
   *
   * The floor alone does the whole job: with no weight at all, the answer
   * section leads and "What he is good at" arrives at rank 2 on its own merits.
   * A weight that can overrule both retrievers is a hand-written ranking
   * wearing a retriever's clothes, which is the thing this file is not allowed
   * to become.
   */
  limitation: NEUTRAL,

  identity: (m) => {
    if (!m) return 1;
    if (m.fromNotes) return 0.6;
    if (!m.dated && m.metrics === 0) return 1.35;
    if (m.current) return 1.15;
    return 1;
  },

  specific: NEUTRAL,
};

export function analyze(question: string): Analysis {
  // A named section beats every heuristic below it. The reader has already said
  // what they want to know about; an intent classifier is only useful when they
  // have not.
  const intent: Intent = IDENTITY.test(question)
    ? "identity"
    : SYSTEM.test(question)
      ? "system"
      : namesASection(question)
        ? "specific"
        : LIMITATION.test(question)
          ? "limitation"
          : SHIPPED.test(question)
            ? "shipped"
            : "specific";

  /*
   * Expansion, from the corpus rather than from a list written here.
   *
   * Both of these questions carry almost no retrievable terms -- "tell me about
   * yourself" survives stopword removal as ["yourself"], which appears nowhere
   * in a third-person corpus, and "what did he ship" as ["ship"]. The words
   * that would have retrieved the right sections are in the frontmatter
   * already, so they are read from there. A second copy of his role written
   * into this file is a copy that can drift.
   */
  const query =
    intent === "identity"
      ? `${question} ${profile.role} ${profile.current} ${profile.focus}`
      : intent === "shipped"
        ? `${question} ${profile.role} ${profile.current} ${profile.focus} shipped built production`
        : question;

  const asked =
    intent === "identity"
      ? question
          .replace(/\byourself\b/gi, profile.name)
          .replace(/\bwho are you\b/gi, `who is ${profile.name}`)
          .replace(/\bare you\b/gi, `is ${profile.name}`)
          .replace(/\byou\b/gi, profile.name)
          .replace(/\byour\b/gi, "his")
      : question;

  return { intent, query, weight: WEIGHTS[intent], asked, floor: intent === "limitation" ? 0.4 : undefined };
}
