import { speakNeural, stopNeural, loadNeuralVoice, neuralReady } from "./neural";

/**
 * Browser speech, in and out.
 *
 * Recognition uses the Web Speech API, which does its own endpointing. That
 * removes a separate voice-activity-detection model and the megabytes it would
 * cost, and it is the reason this whole layer is a couple of hundred lines
 * rather than a pipeline.
 *
 * Synthesis speaks sentence by sentence rather than waiting for a full answer,
 * so audio starts while the rest is still arriving. Everything here is free and
 * on-device: no key, no network, no per-minute cost, and nothing to leak.
 */

type Recognition = {
  start(): void;
  stop(): void;
  abort(): void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

type Ctor = new () => Recognition;

function recognitionCtor(): Ctor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechSupported() {
  return recognitionCtor() !== null;
}

export function synthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Listens until the speaker stops, then resolves with what they said.
 * Interim results are reported so the input can show words as they land, which
 * is the difference between feeling responsive and feeling broken.
 */
export function listen(onInterim: (text: string) => void): {
  done: Promise<string>;
  cancel: () => void;
} {
  const Ctor = recognitionCtor();
  if (!Ctor) return { done: Promise.reject(new Error("unsupported")), cancel: () => {} };

  const recognition = new Ctor();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  let settled = "";
  let cancelled = false;

  const done = new Promise<string>((resolve, reject) => {
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) settled += text;
        else interim += text;
      }
      onInterim(settled + interim);
    };
    recognition.onerror = () => reject(new Error("recognition failed"));
    recognition.onend = () => (cancelled ? reject(new Error("cancelled")) : resolve(settled.trim()));
  });

  recognition.start();

  return {
    done,
    cancel: () => {
      cancelled = true;
      recognition.abort();
    },
  };
}

/**
 * Picks the best available voice.
 *
 * Platforms ship a mix of compact and full-quality voices under similar names,
 * and the default is often the worst one installed. Preferring an explicitly
 * enhanced or premium voice is the single biggest quality difference available
 * without paying for a hosted model.
 */
function bestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  if (voices.length === 0) return null;

  const ranked = [
    (v: SpeechSynthesisVoice) => /premium|enhanced|natural/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.localService && !/compact/i.test(v.name),
    () => true,
  ];

  for (const test of ranked) {
    const match = voices.find(test);
    if (match) return match;
  }
  return voices[0];
}

/**
 * Splits streamed text into speakable sentences.
 *
 * Abbreviations, decimals and version numbers all contain a full stop that does
 * not end a sentence, so splitting naively produces audio that stops mid-thought
 * on "3.6" or "e.g." The first chunk is allowed to be short because starting
 * sooner matters more than prosody on the opening clause.
 */
const ABBREVIATIONS = /\b(?:Mr|Mrs|Ms|Dr|Prof|Inc|Ltd|vs|etc|e\.g|i\.e|No|St|approx)\.$/i;

export function sentences(text: string): { ready: string[]; rest: string } {
  const ready: string[] = [];
  let start = 0;

  for (let i = 0; i < text.length; i++) {
    if (!".!?".includes(text[i])) continue;
    if (!/\s/.test(text[i + 1] ?? " ")) continue;

    const candidate = text.slice(start, i + 1);
    if (ABBREVIATIONS.test(candidate.trimEnd())) continue;
    if (/\d\.$/.test(candidate.trimEnd())) continue;
    if (candidate.trim().length < 10) continue;

    ready.push(candidate.trim());
    start = i + 1;
  }

  return { ready, rest: text.slice(start) };
}

/**
 * Speaks one chunk, using whichever voice can start now.
 *
 * The neural model is roughly 86MB and loads on first use. Awaiting that load
 * before making any sound meant the first answer played nothing at all for as
 * long as the download took, and the built-in fallback never ran because the
 * load had not failed, only not finished. Silence reads as a broken feature.
 *
 * So: if the model is ready, use it. If it is not, speak with the built-in voice
 * immediately and start the download in the background, so the next chunk and
 * every answer after it get the better voice.
 */
export function speak(text: string, onEnd?: () => void) {
  if (neuralReady()) {
    speakNeural(text).then((spoke) => (spoke ? onEnd?.() : speakBuiltIn(text, onEnd)));
    return;
  }

  speakBuiltIn(text, onEnd);
  warmNeural();
}

let warming = false;

/** Starts the model download once, without blocking anything on it. */
export function warmNeural(onProgress?: (pct: number) => void) {
  if (warming || neuralReady()) return;
  warming = true;
  loadNeuralVoice(onProgress).finally(() => {
    warming = false;
  });
}

function speakBuiltIn(text: string, onEnd?: () => void) {
  if (!synthesisSupported()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = bestVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 1.02;
  utterance.pitch = 1;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

/** Stops playback immediately. Used by the stop control and on barge-in. */
export function silence() {
  stopNeural();
  if (synthesisSupported()) window.speechSynthesis.cancel();
}
