import { useCallback, useEffect, useRef, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";

/**
 * SoundProvider — plays a synthesized "blub" pop for bubble clicks and magic
 * reveals. Uses the Web Audio API so there's no asset to load; the sound is
 * generated on demand and never autoplays. A mute toggle is persisted.
 */
const [SoundProviderHook, useSound] = createContextHook(() => {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ff-muted");
    if (stored === "1") setMuted(true);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem("ff-muted", next ? "1" : "0");
      return next;
    });
  }, []);

  /** Lazily create/resume a shared AudioContext (must follow a user gesture). */
  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    if (!ctxRef.current) ctxRef.current = new Ctor();
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  /**
   * playBlub — a short water-drop "blub": a sine tone that pitches down fast,
   * with a quick pluck envelope. Two tiny layers give it a bubbly body.
   */
  const playBlub = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
    master.gain.exponentialRampToValueAtTime(0.5, now + 0.012);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(560, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.16);

    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(320, now);
    sub.frequency.exponentialRampToValueAtTime(90, now + 0.2);
    const subGain = ctx.createGain();
    subGain.gain.value = 0.45;

    osc.connect(master);
    sub.connect(subGain).connect(master);

    osc.start(now);
    sub.start(now);
    osc.stop(now + 0.34);
    sub.stop(now + 0.34);
  }, [muted, getCtx]);

  return { muted, toggleMuted, playBlub };
});

export const SoundProvider = SoundProviderHook;
export { useSound };
