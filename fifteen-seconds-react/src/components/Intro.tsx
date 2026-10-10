import { useEffect, useState } from "react";
import { useStory } from "../store";
import { sound } from "../audio";
import { scrollToId } from "../hooks";

type Phase = "idle" | "count" | "cut" | "done";
const SECONDS = 15;

export default function Intro() {
  const { state, dispatch } = useStory();
  const [phase, setPhase] = useState<Phase>("idle");
  const [left, setLeft] = useState(SECONDS);
  const [announce, setAnnounce] = useState("");

  // Live 15-second countdown. Cleared on unmount / phase change (StrictMode-safe).
  useEffect(() => {
    if (phase !== "count") return;
    let t = SECONDS;
    setLeft(SECONDS);
    const id = window.setInterval(() => {
      t -= 1;
      setLeft(t);
      if (t > 0) {
        sound.tick(t <= 3);
        if (t === 10 || t === 5 || t === 3 || t === 1) setAnnounce(`${t} seconds left`);
      } else {
        window.clearInterval(id);
        sound.honk(1.3);
        setAnnounce("The light has changed.");
        setPhase("cut");
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // Hard cut to black, then reveal the title block.
  useEffect(() => {
    if (phase !== "cut") return;
    const id = window.setTimeout(() => setPhase("done"), 700);
    return () => window.clearTimeout(id);
  }, [phase]);

  const begin = () => {
    dispatch({ type: "begin" });
    scrollToId("ch-01", state.motionOK);
  };

  return (
    <section id="intro" aria-labelledby="intro-title" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-5 py-16 text-paper">
      <p className="font-hand text-paper/70 text-lg">A signal. A morning. A question.</p>

      <div aria-hidden className="big-count mt-4 text-blood">
        {phase === "count" || phase === "cut" ? left : SECONDS}
      </div>
      <p className="sr-only" aria-live="polite">{announce}</p>

      {phase === "idle" && (
        <div className="mt-6 flex flex-col items-center gap-5">
          <button type="button" className="btn-paper pulse-ring" onClick={() => setPhase(state.motionOK ? "count" : "done")}>
            Press the signal <span aria-hidden>↗</span>
          </button>
          <p className="text-paper/60 max-w-xs text-center font-hand">A city gave everyone the same amount of time.</p>
        </div>
      )}

      {phase === "count" && (
        <button type="button" className="btn-ghost mt-6" onClick={() => setPhase("done")}>
          Skip countdown
        </button>
      )}

      {phase === "done" && (
        <div className="mt-6 max-w-2xl text-center">
          <p className="font-display tracking-[.3em] text-amber text-sm">AN INTERACTIVE MANGA</p>
          <h1 id="intro-title" className="chapter-title mt-3">
            FIFTEEN<br /><span className="text-blood">SECONDS</span>
          </h1>
          <p className="mt-6 text-lg text-paper/85">A city gave everyone the same amount of time.</p>
          <p className="text-lg text-paper/65">But it forgot that people move differently.</p>
          <button type="button" className="btn-paper mt-8" onClick={begin}>
            Begin <span aria-hidden>↗</span>
          </button>
        </div>
      )}

      {phase === "cut" && <div className="fade-black" aria-hidden />}

      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
        <span className="font-display text-xs tracking-widest text-paper/40">SCENE 00 · THE COUNTDOWN</span>
        <button
          type="button"
          className="btn-ghost text-xs"
          aria-pressed={state.soundOn}
          aria-label={state.soundOn ? "Turn ambient sound off" : "Turn ambient sound on"}
          onClick={() => dispatch({ type: "sound", v: !state.soundOn })}
        >
          Sound {state.soundOn ? "on" : "off"}
        </button>
      </div>
      {phase === "done" && <h2 className="sr-only">Chapter 01 follows</h2>}
    </section>
  );
}
