import { useRef } from "react";
import { Section, Folio, ContinueButton } from "../bits";
import { useProgress } from "../hooks";
import { IMG } from "../images";

// Chapter 09 — the same intersection on a different morning. The scroll is Dadu's walking pace.
export default function Ch09ThirtyFour() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const p = useProgress(wrapRef);
  const seconds = Math.round(p * 34);

  return (
    <Section id="ch-09" n="09" title="34 SECONDS" className="bg-ink text-paper">
      <div ref={wrapRef} className="scene" style={{ height: "300vh" }}>
        <div className="scene-stick">
          <img
            src={IMG.calm}
            alt="The same crossing on a calmer morning, with the signal showing green and space on the stripes."
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-ink/35" aria-hidden />
          <Folio n="09" title="34 SECONDS" />

          <div
            aria-hidden
            className="absolute bottom-[10%] h-[34vh] w-[9vh] text-ink"
            style={{ left: `${6 + p * 76}%` }}
          >
            <svg viewBox="0 0 40 110" className="h-full w-full" fill="currentColor">
              <circle cx="20" cy="12" r="9" />
              <rect x="12" y="24" width="16" height="44" rx="6" />
              <rect x="13" y="66" width="6" height="40" />
              <rect x="21" y="66" width="6" height="40" />
            </svg>
          </div>

          <div className="absolute right-5 top-24 md:right-10">
            <p className="font-display text-sm tracking-widest text-paper/70">TIME TAKEN TO CROSS</p>
            <p className="big-count text-amber" aria-live="off">{seconds}<span className="text-4xl"> s</span></p>
          </div>

          <p className="walker-cap absolute bottom-6 left-5 max-w-xs text-lg text-paper md:left-10">
            Your scrolling is Dadu's walking pace.
          </p>
        </div>
      </div>
      <div className="bg-ink px-5 pb-16 pt-6 md:px-10">
        <ContinueButton to="ch-10" />
      </div>
    </Section>
  );
}
