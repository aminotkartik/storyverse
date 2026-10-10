import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { StoryProvider, useStory } from "./store";
import { sound } from "./audio";
import { scrollToId } from "./hooks";
import Loader from "./components/Loader";
import Intro from "./components/Intro";
import Hud from "./components/Hud";
import Ch01Crossing from "./components/Ch01Crossing";
import Ch02Compare from "./components/Ch02Compare";
import Ch03LookAgain from "./components/Ch03LookAgain";
import Ch04Average from "./components/Ch04Average";
import Ch05Mirror from "./components/Ch05Mirror";
import Ch06Notebook from "./components/Ch06Notebook";
import Ch07Poster from "./components/Ch07Poster";
import Ch08SecondPerson from "./components/Ch08SecondPerson";
import Ch09ThirtyFour from "./components/Ch09ThirtyFour";
import Ch10CityFinale from "./components/Ch10CityFinale";
import Pledge from "./components/Pledge";
import Finale from "./components/Finale";

// Typing into a field must never trigger story shortcuts.
function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

function Shell() {
  const { state, dispatch } = useStory();
  const { motionOK, began, present, soundOn } = state;
  const autoTimer = useRef<number | null>(null);

  // Smooth scroll — skipped entirely when motion is reduced or switched off.
  useEffect(() => {
    if (!motionOK) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [motionOK]);

  // Sound toggle → engine. Engine stays silent until enabled from a gesture.
  useEffect(() => {
    if (soundOn) { sound.enable(); sound.city(0.05); } else sound.disable();
  }, [soundOn]);

  // Chapter tracking (drives the folio in the HUD).
  useEffect(() => {
    const els = document.querySelectorAll("[data-chapter]");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const n = e.target.getAttribute("data-chapter") ?? "";
        const title = e.target.getAttribute("data-title") ?? "";
        const i = parseInt(n, 10);
        dispatch({ type: "chapter", i: Number.isNaN(i) ? 10 : i, n, title });
      }),
      { rootMargin: "-40% 0px -40% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dispatch]);

  // Hidden shortcuts: P = presentation mode · E = experience from the beginning.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "p") {
        if (!began) return;
        const v = !present;
        dispatch({ type: "present", v });
        if (v) {
          scrollToId("ch-01", motionOK);
          if (autoTimer.current) window.clearTimeout(autoTimer.current);
          autoTimer.current = window.setTimeout(() => window.dispatchEvent(new Event("fs:auto-ch1")), 1600);
        }
      } else if (k === "e") {
        try { history.scrollRestoration = "manual"; } catch { /* noop */ }
        window.scrollTo(0, 0);
        window.location.reload();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (autoTimer.current) window.clearTimeout(autoTimer.current);
    };
  }, [began, present, motionOK, dispatch]);

  return (
    <div className="bg-ink min-h-screen">
      <a
        href="#ch-01"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-1/2 focus:-translate-x-1/2 focus:z-[100] focus:bg-paper focus:text-ink focus:px-4 focus:py-2 focus:font-display focus:tracking-widest"
      >
        SKIP TO THE STORY
      </a>

      {!state.started && <Loader onDone={() => dispatch({ type: "start" })} />}
      <div className="grain noise-uri" aria-hidden />
      {state.started && <Hud />}

      <main aria-label="FIFTEEN SECONDS — an interactive manga">
        <Intro />
        <Ch01Crossing />
        <Ch02Compare />
        <Ch03LookAgain />
        <Ch04Average />
        <Ch05Mirror />
        <Ch06Notebook />
        <Ch07Poster />
        <Ch08SecondPerson />
        <Ch09ThirtyFour />
        <Ch10CityFinale />
        <Pledge />
        <Finale />
      </main>

      {present && (
        <div className="fixed bottom-3 inset-x-0 z-40 text-center pointer-events-none hud-ui">
          <span className="font-hand text-xs text-paper/40">presentation mode — P to exit</span>
        </div>
      )}
    </div>
  );
}

export default function App(): ReactNode {
  return (
    <StoryProvider>
      <Shell />
    </StoryProvider>
  );
}
