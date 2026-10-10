import { useRef } from "react";
import { Section, Folio, Halftone, ContinueButton } from "../bits";
import { useProgress, seg } from "../hooks";
import { IMG } from "../images";

// Chapter 10 — the view zooms out from one crossing to a whole city, then the thesis lands.
export default function Ch10CityFinale() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const p = useProgress(wrapRef);
  const zoom = 1.6 - p * 1.0;
  const thesis = seg(p, 0.55, 0.9);

  return (
    <Section id="ch-10" n="10" title="THE CITY" className="bg-ink text-paper">
      <div ref={wrapRef} className="scene" style={{ height: "300vh" }}>
        <div className="scene-stick overflow-hidden">
          <img
            src={IMG.crossing}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: `scale(${zoom})`, opacity: 1 - seg(p, 0.6, 1) * 0.6 }}
          />
          <Halftone className="opacity-50" />
          <div className="absolute inset-0 bg-ink/60" aria-hidden />
          <Folio n="10" title="THE CITY" />

          <div className="absolute inset-x-5 bottom-16 mx-auto max-w-3xl text-center md:bottom-24">
            <p className="font-display text-sm tracking-widest text-paper/60" style={{ opacity: 1 - thesis }}>
              One crossing. Then a whole city.
            </p>
            <p
              className="mt-4 font-display text-[clamp(2rem,7vw,5rem)] uppercase leading-[.95]"
              style={{ opacity: thesis, transform: `translateY(${(1 - thesis) * 24}px)` }}
            >
              A city should not ask people to become faster.
              <br />
              <span className="text-amber">It should learn to become fairer.</span>
            </p>
          </div>
        </div>
      </div>
      <div className="bg-ink px-5 pb-16 pt-6 md:px-10">
        <ContinueButton to="pledge" label="YOUR NOTE" />
      </div>
    </Section>
  );
}
