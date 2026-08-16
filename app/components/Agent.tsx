"use client";

import { useEffect, useRef, useState } from "react";
import { listen, speak, silence, speechSupported, synthesisSupported, warmNeural } from "@/lib/voice/speech";
import { track, trackOnce } from "@/lib/analytics";
import styles from "./Agent.module.css";

type Result = {
  answer: string;
  route: string;
  timings: Record<string, number>;
  total: number;
  sources: string[];
  usage?: { in: number; out: number } | null;
  limited?: boolean;
};

type Turn = { question: string; result: Result | null };

/**
 * Openers exist because a blank input is the most common reason a visitor never
 * uses one of these. Each is a question a recruiter actually asks, so the first
 * answer is useful rather than a demonstration that the box works.
 */
const OPENERS = [
  "What has he shipped on Azure?",
  "What broke in production and how did he find it?",
  "How does he decide when multi-agent is worth it?",
];

export default function Agent({ email, linkedin }: { email: string; linkedin: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [openTrace, setOpenTrace] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const stream = useRef<EventSource | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [listening, setListening] = useState(false);
  /** Set when the microphone is unavailable, so the failure is stated rather than silent. */
  const [micError, setMicError] = useState<string | null>(null);
  /** Rendered after mount: the shortcut differs by platform and the server cannot know it. */
  const [modKey, setModKey] = useState("Ctrl");
  const [voiceOn, setVoiceOn] = useState(false);
  const [canVoice, setCanVoice] = useState(false);
  const mic = useRef<{ cancel: () => void } | null>(null);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);

  // Capability is read after mount: it differs per browser, and rendering a
  // control on the server that will not work on the client is worse than not
  // offering it. Firefox has no speech recognition, so it gets the text path
  // with nothing broken on screen.
  useEffect(() => {
    setCanVoice(speechSupported() && synthesisSupported());
    if (navigator.platform?.startsWith("Mac")) setModKey("\u2318");
    trackOnce("view");
  }, []);

  /**
   * Select any text on the page to ask about it.
   *
   * The blank input is the main reason a visitor never uses one of these, and a
   * phrase they just highlighted is the one question they are provably already
   * thinking about.
   */
  useEffect(() => {
    function onSelect() {
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";
      if (!sel || text.length < 12 || text.length > 200 || sel.rangeCount === 0) {
        setSelection(null);
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setSelection({ text, x: rect.left + rect.width / 2, y: rect.top - 8 });
    }
    document.addEventListener("selectionchange", onSelect);
    return () => document.removeEventListener("selectionchange", onSelect);
  }, []);

  /**
   * A shared link carries the question, not the answer. Replaying a stored answer
   * would show a stale one and quietly turn a live demo into a screenshot, so the
   * question is re-asked against the current corpus on arrival.
   */
  useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get("q");
    if (shared) submit(shared.slice(0, 300));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(question: string) {
    if (!question.trim() || pending) return;

    trackOnce("agent_opened");
    track("agent_asked", question);

    const index = turns.length;
    setTurns((t) => [...t, { question, result: null }]);
    setPending(true);

    // Streamed over Server-Sent Events. The answer is assembled here rather than
    // waiting on a settled response, so the first words appear roughly a second
    // before the last ones are written.
    const source = new EventSource(`/api/agent/stream?q=${encodeURIComponent(question)}`);
    stream.current = source;

    let answer = "";
    let route = "answer";
    let sources: string[] = [];
    const timings: Record<string, number> = {};
    const startedAt = performance.now();

    const settle = (extra: Partial<Result> = {}) => {
      setTurns((t) =>
        t.map((turn, i) =>
          i === index
            ? {
                ...turn,
                result: {
                  answer,
                  route,
                  timings,
                  total: Math.round(performance.now() - startedAt),
                  sources,
                  ...extra,
                },
              }
            : turn,
        ),
      );
    };

    const finish = () => {
      source.close();
      stream.current = null;
      setPending(false);
      if (voiceOn && answer) speak(answer);
    };

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "route") {
        route = data.route;
        timings.route = data.ms;
      } else if (data.type === "sources") {
        sources = data.titles;
        timings.retrieve = data.ms;
      } else if (data.type === "token") {
        answer += data.text;
        settle();
      } else if (data.type === "error") {
        answer = data.message;
        settle();
        finish();
      } else if (data.type === "done") {
        timings.answer = Math.max(0, data.total - (timings.route ?? 0) - (timings.retrieve ?? 0));
        settle({ usage: data.usage });
        finish();
      }
    };

    // EventSource retries on its own, which would re-ask a paid question. One
    // failure ends the turn and leaves the typed path untouched.
    source.onerror = () => {
      if (!answer) answer = `Connection dropped. He is reachable at ${email}.`;
      settle();
      finish();
    };
  }


  /** One control ends everything in flight: generation, playback, and the mic. */
  function stop() {
    stream.current?.close();
    stream.current = null;
    setPending(false);
    silence();
    mic.current?.cancel();
    setListening(false);
  }

  async function startListening() {
    if (listening) {
      mic.current?.cancel();
      setListening(false);
      return;
    }

    // Barge-in: speaking over the agent stops it rather than talking across it.
    silence();
    trackOnce("voice_used");
    setMicError(null);
    setListening(true);

    const session = listen((interim) => {
      if (inputRef.current) inputRef.current.value = interim;
    });
    mic.current = session;

    try {
      const said = await session.done;
      if (inputRef.current) inputRef.current.value = "";
      if (said) submit(said);
    } catch {
      // Denied, dismissed, or no device. Saying so matters: a permission prompt
      // that gets dismissed leaves the button looking pressed and nothing
      // happening, which reads as a broken agent rather than a blocked mic.
      setMicError("Microphone blocked. Typing works the same.");
    } finally {
      setListening(false);
      mic.current = null;
    }
  }

  /**
   * The conversion step. LinkedIn removed URL-prefilled connection notes, so the
   * line goes to the clipboard and the profile opens in a new tab. That also
   * works for email, a referral thread, or anywhere else they would rather write.
   */
  async function copyOpener(turn: Turn) {
    const line = `Saw your agent answer "${turn.question}" on your site. Wanted to ask about it.`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard blocked. The contact links below are unaffected.
    }
  }

  async function shareTurn(turn: Turn) {
    const url = `${window.location.origin}${window.location.pathname}?q=${encodeURIComponent(turn.question)}#agent`;
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2400);
      track("contact", "share");
    } catch {
      // Clipboard blocked; the contact links beside this are unaffected.
    }
  }

  const last = turns[turns.length - 1];
  const showConversion = last?.result && !last.result.limited && last.result.route === "answer";

  return (
    <div className={styles.agent}>
      {selection && (
        <button
          className={styles.selectAsk}
          style={{ left: selection.x, top: selection.y }}
          onClick={() => {
            const text = selection.text;
            setSelection(null);
            window.getSelection()?.removeAllRanges();
            document.getElementById("agent")?.scrollIntoView({ behavior: "smooth" });
            submit(`What does this mean: "${text}"`);
          }}
        >
          Ask about this
        </button>
      )}
      <form
        className={styles.bar}
        onSubmit={(e) => {
          e.preventDefault();
          const value = inputRef.current?.value ?? "";
          if (inputRef.current) inputRef.current.value = "";
          submit(value);
        }}
      >
        <input
          id="ask"
          ref={inputRef}
          className={styles.input}
          placeholder="Ask about his work"
          aria-label="Ask about his work"
          maxLength={500}
          disabled={pending}
        />
        {canVoice && !pending && (
          <button
            type="button"
            className={listening ? `${styles.mic} ${styles.micOn}` : styles.mic}
            onClick={startListening}
            aria-pressed={listening}
            aria-label={listening ? "Stop listening" : "Ask by voice"}
          >
            {listening ? "Listening" : "Speak"}
          </button>
        )}
        {pending || listening ? (
          <button type="button" className={styles.stop} onClick={stop}>
            Stop
          </button>
        ) : (
          <button type="submit" className={styles.send}>
            Ask
          </button>
        )}
      </form>

      {canVoice && (
        <label className={styles.voiceToggle}>
          <input
            type="checkbox"
            checked={voiceOn}
            onChange={(e) => {
              setVoiceOn(e.target.checked);
              if (e.target.checked) {
                // Start the model download the moment someone opts in, rather
                // than on the first answer. By the time a question is typed and
                // answered it is usually ready, so the first spoken reply gets
                // the neural voice instead of the built-in one.
                warmNeural();
              } else {
                silence();
              }
            }}
          />
          Read answers aloud
        </label>
      )}

      {micError && (
        <p className={styles.micError} role="status">
          {micError}
        </p>
      )}

      {/* What this page can do, said once, where the agent is.
          Select-to-ask, the trace, the command palette and the share link were
          all reachable and none of them were named, which meant a visitor had to
          guess they existed. */}
      {/* Written for someone who has never used a command palette and does not
          know what a trace is. Each line says what to do first and what happens
          because of it, in that order, because an instruction a reader has to
          decode is one they skip. */}
      <ul className={styles.affordances}>
        <li>
          <span className={styles.keys}>
            <kbd className={styles.kbd}>{modKey}</kbd>
            <kbd className={styles.kbd}>K</kbd>
          </span>
          <span>
            <b>Jump anywhere on this page.</b> Opens a search box for every section.
          </span>
        </li>
        <li>
          <span className={styles.keys} aria-hidden="true">
            <span className={styles.gesture}>drag</span>
          </span>
          <span>
            <b>Highlight any sentence.</b> A button appears to ask the agent about exactly that.
          </span>
        </li>
        <li>
          <span className={styles.keys} aria-hidden="true">
            <span className={styles.gesture}>trace</span>
          </span>
          <span>
            <b>Open the trace under any answer.</b> It shows where the answer came from, how long
            each step took, and what it cost in tokens.
          </span>
        </li>
      </ul>

      <ul className={styles.openers}>
          {OPENERS.map((q) => (
            <li key={q}>
              <button className={styles.opener} onClick={() => submit(q)}>
                {q}
              </button>
            </li>
          ))}
      </ul>

      <div className={styles.thread} aria-live="polite">
        {turns.map((turn, i) => {
          // Only the newest exchange stays open. Earlier ones collapse to the
          // question, which keeps the history reachable without letting a third
          // answer push the rest of the page out of view.
          const latest = i === turns.length - 1;
          if (!latest)
            return (
              <button
                key={i}
                className={styles.past}
                onClick={() => submit(turn.question)}
                title="Ask again"
              >
                {turn.question}
              </button>
            );
          return (
          <article key={i} className={styles.turn}>
            <p className={styles.question}>{turn.question}</p>

            {!turn.result ? (
              <p className={styles.thinking}>
                <span className="live-dot" /> <span className="live">running the graph</span>
              </p>
            ) : (
              <>
                {/* Answer first, complete on its own. Evidence and trace are
                    below it, so a reader who only wants the answer is done. */}
                <p className={styles.answer}>{turn.result.answer}</p>

                {/* Each retrieved section is its own element rather than one
                    joined string, so they can arrive one after another as the
                    retrieval did. The stagger is not decoration: four sources
                    landing in sequence is the difference between the answer
                    looking generated and looking fetched. Safe to animate from
                    nothing because these nodes did not exist a moment ago. */}
                {turn.result.sources.length > 0 && (
                  <p className={styles.sources}>
                    <span className="label">grounded in</span>{" "}
                    {turn.result.sources.map((s, n) => (
                      <span
                        key={s}
                        className={styles.source}
                        style={{ "--n": n } as React.CSSProperties}
                      >
                        {s}
                      </span>
                    ))}
                  </p>
                )}

                {Object.keys(turn.result.timings).length > 0 && (
                  <>
                    <button
                      className={styles.traceToggle}
                      aria-expanded={openTrace === i}
                      onClick={() => setOpenTrace(openTrace === i ? null : i)}
                    >
                      {openTrace === i ? "hide trace" : "trace"}{" "}
                      <span className="tabular">{turn.result.total}ms</span>
                      {turn.result.usage && (
                        <>
                          {" \u00b7 "}
                          <span className="tabular">
                            {turn.result.usage.in + turn.result.usage.out} tokens
                          </span>
                        </>
                      )}
                      {turn.result.route !== "answer" && (
                        <>
                          {" \u00b7 "}
                          <span>{turn.result.route}</span>
                        </>
                      )}
                    </button>

                    {openTrace === i && (
                      <dl className={styles.trace}>
                        {Object.entries(turn.result.timings).map(([node, ms]) => (
                          <div key={node} className={styles.traceRow}>
                            <dt>{node}</dt>
                            <dd className="tabular">{ms}ms</dd>
                            <dd
                              className={styles.traceBar}
                              style={{ ["--w" as string]: `${(ms / turn.result!.total) * 100}%` }}
                            />
                          </div>
                        ))}
                        {turn.result.usage && (
                          <div className={styles.traceRow}>
                            <dt>tokens</dt>
                            <dd className="tabular">
                              {turn.result.usage.in + turn.result.usage.out}
                            </dd>
                            <dd className={styles.usage}>
                              {turn.result.usage.in} in · {turn.result.usage.out} out · $0.00 on a
                              free tier
                            </dd>
                          </div>
                        )}
                      </dl>
                    )}
                  </>
                )}
              </>
            )}
          </article>
          );
        })}
      </div>

      {showConversion && (
        <div className={styles.conversion}>
          <button className={styles.copy} onClick={() => copyOpener(last)}>
            {copied ? "Copied. Paste it anywhere." : "Copy an opening line"}
          </button>
          <button className={styles.copy} onClick={() => shareTurn(last)}>
            {shared ? "Link copied" : "Share this answer"}
          </button>
          <a href={linkedin} target="_blank" rel="noreferrer" onClick={() => track("contact", "linkedin")}>
            LinkedIn
          </a>
          <a href={`mailto:${email}`} onClick={() => track("contact", "email")}>
            {email}
          </a>
        </div>
      )}
    </div>
  );
}
