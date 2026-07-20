/**
 * Neural speech, on-device.
 *
 * The browser's built-in voice is the one people recognise as a screen reader,
 * and it is the reason a talking portfolio usually sounds worse than silence.
 * Kokoro is an 82M-parameter model that runs entirely in the tab: no key, no
 * per-minute cost, nothing sent anywhere, and a voice that does not announce
 * itself as an operating system.
 *
 * The cost is an ~86MB download, so it is fetched only when a visitor turns
 * speech on, cached by the browser afterwards, and never blocks the page. Until
 * it is ready, and on any browser where it will not run, speech falls back to
 * the built-in voice rather than going quiet.
 */

type Session = {
  generate(text: string, opts: { voice: string }): Promise<{ toWav(): ArrayBuffer }>;
};

let session: Session | null = null;
let loading: Promise<Session | null> | null = null;
let unavailable = false;

/** Whether the fast path is available. WebGPU is checked, not assumed. */
async function pickDevice(): Promise<"webgpu" | "wasm"> {
  const gpu = (navigator as { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
  if (!gpu) return "wasm";
  try {
    return (await gpu.requestAdapter()) ? "webgpu" : "wasm";
  } catch {
    return "wasm";
  }
}

/**
 * Loads the model once per tab. Concurrent callers share the same promise so a
 * visitor who toggles speech twice does not start two 86MB downloads.
 */
export function loadNeuralVoice(onProgress?: (pct: number) => void): Promise<Session | null> {
  if (session) return Promise.resolve(session);
  if (unavailable) return Promise.resolve(null);
  if (loading) return loading;

  loading = (async () => {
    try {
      // Dynamic so the model runtime stays out of the main bundle: a visitor who
      // never turns on speech never downloads any of it.
      const { KokoroTTS } = await import("kokoro-js");
      const device = await pickDevice();

      const tts = (await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
        dtype: device === "webgpu" ? "fp32" : "q8",
        device,
        progress_callback: (p: { status: string; progress?: number }) => {
          if (p.status === "progress" && typeof p.progress === "number") onProgress?.(p.progress);
        },
      })) as unknown as Session;

      session = tts;
      return tts;
    } catch {
      // No WebGPU, no WASM threads, blocked CDN, or an out-of-memory tab. Marked
      // permanently unavailable so every later call goes straight to the
      // built-in voice instead of retrying an 86MB download.
      unavailable = true;
      return null;
    } finally {
      loading = null;
    }
  })();

  return loading;
}

let current: HTMLAudioElement | null = null;

/** Stops neural playback. Separate from synthesis cancel, which it does not affect. */
export function stopNeural() {
  if (current) {
    current.pause();
    current.src = "";
    current = null;
  }
}

/**
 * Speaks one chunk. Resolves false when the model is not available, which is the
 * caller's signal to use the built-in voice for this chunk.
 */
export async function speakNeural(text: string, voice = "af_heart"): Promise<boolean> {
  const tts = session ?? (await loadNeuralVoice());
  if (!tts) return false;

  try {
    const audio = await tts.generate(text, { voice });
    const blob = new Blob([audio.toWav()], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    stopNeural();
    const el = new Audio(url);
    current = el;

    await new Promise<void>((resolve) => {
      el.onended = () => resolve();
      el.onerror = () => resolve();
      el.play().catch(() => resolve());
    });

    URL.revokeObjectURL(url);
    if (current === el) current = null;
    return true;
  } catch {
    return false;
  }
}

export const neuralReady = () => session !== null;
export const neuralUnavailable = () => unavailable;
