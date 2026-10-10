import { useEffect, useRef, useState } from "react";
import { Section, Folio, Halftone, Reveal, ContinueButton } from "../bits";
import { useProgress } from "../hooks";
import { useStory } from "../store";
import { sound } from "../audio";
import { IMG } from "../images";

const TOTAL = 15_000;

// Chapter 01 — The Crossing. The timer is timestamp-based, so it keeps running
// while the reader scrolls. At 5s left the camera pushes in; at 3s traffic wins.
export default function Ch01Crossing() {
  const { state } = useStory();
  const wrapRef = useRef<HTMLDivElement>(null);
  const p = useProgress(wrapRef);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const honked = useRef(false);

  const start = () => {
    if (startedAt !== null) return;
    const t = performance.now();
    honked.current = false;
    setNow(t);
    setStartedAt(t);
  };

  useEffect(() => {
    const onAuto = () => start();
    window.addEventListener("fs:auto-ch1", onAuto);
    return () => window.removeEventListener("fs:auto-ch1", onAuto);
    // start() reads only refs and stable setters, so binding once is correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (startedAt === null) return;
    const id = window.setInterval(() => setNow(performance.now()), 100);
    return () => window.clearInterval(id);
  }, [startedAt]);

  const elapsed = startedAt === null ? 0 : Math.min(TOTAL, now - startedAt);
  const left = Math.ceil((TOTAL - elapsed) / 1000);
  const running = startedAt !== null && elapsed < TOTAL;
  const done = startedAt !== null && elapsed >= TOTAL;
  const pushing = elapsed >= 10_000;
  const winning = elapsed >= 12_000;

  // One tick per second while the signal runs; the final three are sharper.
  useEffect(() => {
    if (!running || left <= 0 || left >= 15) return;
    sound.tick(left <= 3);
  }, [left, running]);

  useEffect(() => {
    if (winning && !honked.current) {
      honked.current = true;
      sound.honk(1.2);
    }
  }, [winning]);

  const scale = pushing ? 1.22 : 1 + p * 0.06;

  return (
    <>
      <Section id="ch-01" n="01" title="THE CROSSING" className="bg-ink text-paper">
        <div ref={wrapRef} className="scene" style={{ height: "170vh" }}>
          <div className="scene-stick">
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={IMG.crossing}
                alt="A busy intersection: buses, autos and motorcycles surge toward a zebra crossing, while a young woman and an older man wait at the kerb."
                className={`absolute inset-0 h-full w-full object-cover ${state.motionOK ? "cam-push" : ""}`}
                style={{ transform: `scale(${scale})` }}
                fetchPriority="high"
              />
              <Halftone className="opacity-40" />
            </div>

            <Folio n="01" title="THE CROSSING" />

            <div className="ink-panel absolute bottom-6 left-4 w-[min(92vw,22rem)] p-4 text-ink md:left-10">
              <p className="font-hand text-sm">Signal 14A · pedestrian countdown</p>
              <div className={`big-count mt-1 ${running && left <= 3 ? "text-blood count-pop" : "text-ink"}`} aria-hidden>
                {startedAt === null ? 15 : left}
              </div>
              <p className="sr-only" aria-live="polite">
                {done ? "The signal has ended." : running ? `${left} seconds left` : ""}
              </p>
              {startedAt === null && (
                <button type="button" className="btn-ink mt-3 w-full justify-center" onClick={start}>
                  Press the signal
                </button>
              )}
              {running && <p className="mt-2 text-sm">The timer keeps running while you scroll.</p>}
            </div>

            {winning && !done && (
              <span className="stamp absolute right-4 top-24 md:right-10 md:top-28 text-blood">Traffic wins</span>
            )}

            {done && (
              <div className="bubble bubble-in absolute right-4 top-24 max-w-xs p-4 md:right-10">
                <p className="font-hand text-base">Tara is across. Dadu is still on the kerb, and the light is gone.</p>
              </div>
            )}
          </div>
        </div>
      </Section>

      <div className="bg-ink px-5 pb-16 pt-10 text-paper">
        <Reveal>
          <p className="font-hand text-paper/70">Scroll on. The city doesn't pause for you.</p>
        </Reveal>
        <div className="mt-6">
          <ContinueButton to="ch-02" />
        </div>
      </div>
    </>
  );
}
