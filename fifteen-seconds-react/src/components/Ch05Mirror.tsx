import { useRef, useState } from "react";
import { Section, Folio, ContinueButton } from "../bits";
import { useProgress, seg } from "../hooks";

// Chapter 05 — scrolling turns "THE SYSTEM" into "US". The button is an alternative control.
export default function Ch05Mirror() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const p = useProgress(wrapRef);
  const [turned, setTurned] = useState(false);
  const v = turned ? 1 : p;
  const t = seg(v, 0.3, 0.75);

  return (
    <Section id="ch-05" n="05" title="THE MIRROR" className="bg-ink text-paper">
      <div ref={wrapRef} className="scene" style={{ height: "260vh" }}>
        <div className="scene-stick flex flex-col items-center justify-center gap-8 px-5">
          <Folio n="05" title="THE MIRROR" />
          <div className="monitor relative flex h-[46vh] w-full max-w-3xl items-center justify-center">
            <div aria-live="polite" className="font-display text-[clamp(3rem,13vw,10rem)] uppercase leading-none">
              <span className="block text-center text-paper" style={{ opacity: 1 - t, transform: `translateY(${-t * 12}vh)` }}>
                The system
              </span>
              <span className="block text-center text-amber" style={{ opacity: t, transform: `scale(${0.8 + 0.2 * t})` }}>
                Us
              </span>
            </div>
            <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-paper/25" />
          </div>
          <p className="font-hand text-lg text-paper/70">Scroll to turn the mirror.</p>
          <button
            type="button"
            className="btn-ghost"
            aria-pressed={turned}
            onClick={() => setTurned((x) => !x)}
          >
            {turned ? "Turn it back" : "Turn the mirror"}
          </button>
        </div>
      </div>
      <div className="bg-ink px-5 pb-16 pt-6 md:px-10">
        <ContinueButton to="ch-06" />
      </div>
    </Section>
  );
}
