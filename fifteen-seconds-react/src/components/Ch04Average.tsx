import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Section, Folio, Reveal, ContinueButton } from "../bits";
import { useStory } from "../store";

const FRAGMENTS = [
  "a child", "an elderly person", "a parent", "a wheelchair user",
  "an injured person", "a student", "a worker", "a tourist", "everyone",
];

function Letters({ word }: { word: string }) {
  return (
    <>
      {word.split("").map((ch, i) => (
        <span key={`${word}-${i}`} className="avg-letter inline-block">{ch}</span>
      ))}
    </>
  );
}

// Chapter 04 — the phrase AVERAGE PEDESTRIAN fractures (GSAP) into the people it excluded.
export default function Ch04Average() {
  const { state } = useStory();
  const phraseRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => () => { tlRef.current?.kill(); }, []);

  const breakPhrase = () => {
    if (broken) return;
    if (!state.motionOK || !phraseRef.current) {
      setBroken(true); // instant state for reduced motion
      return;
    }
    const letters = phraseRef.current.querySelectorAll(".avg-letter");
    const tl = gsap.timeline({ onComplete: () => setBroken(true) });
    tl.to(letters, {
      x: () => gsap.utils.random(-260, 260),
      y: () => gsap.utils.random(-180, 180),
      rotation: () => gsap.utils.random(-80, 80),
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      stagger: { each: 0.025, from: "random" },
    });
    tlRef.current = tl;
  };

  return (
    <Section id="ch-04" n="04" title="THE AVERAGE HUMAN" className="bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-5 py-20 md:px-10">
        <Folio n="04" title="THE AVERAGE HUMAN" />

        <div className="monitor mt-8 p-5 font-display text-sm tracking-widest text-leaf">
          CROSSING 14A · SIMULATION · PARAMETER: AVERAGE PEDESTRIAN · 15 S
        </div>

        <div className="mt-8 space-y-4">
          <Reveal><div className="bubble max-w-md p-4"><p className="font-display text-xs tracking-widest text-blood">TARA</p><p className="text-lg">“Average?”</p></div></Reveal>
          <Reveal delay={150}><div className="bubble ml-auto max-w-lg p-4"><p className="font-display text-xs tracking-widest text-blood">TARA</p><p className="text-lg">“But who is the average pedestrian?”</p></div></Reveal>
        </div>

        <div ref={phraseRef} className="mt-14 font-display uppercase leading-none" aria-live="polite">
          <div className="text-[clamp(2.2rem,9vw,6rem)]" aria-label={broken ? "Average pedestrian, broken apart" : "Average pedestrian"}>
            <span className={broken ? "sr-only" : ""}><Letters word="AVERAGE" /></span>
            {" "}
            <span className={broken ? "sr-only" : ""}><Letters word="PEDESTRIAN" /></span>
          </div>
        </div>

        {!broken && (
          <button type="button" className="btn-paper mt-8" onClick={breakPhrase}>
            Break the average
          </button>
        )}

        {broken && (
          <div className="mt-10">
            <p className="font-display text-3xl uppercase text-amber">The people the average left out</p>
            <ul className="mt-4 flex flex-wrap gap-3" aria-label="The people included in the average">
              {FRAGMENTS.map((f) => (
                <li key={f} className="ink-panel--dark px-3 py-2 font-hand text-lg">{f}</li>
              ))}
            </ul>
            <p className="mt-8 font-display text-4xl uppercase">There is no average person.</p>
          </div>
        )}

        <div className="mt-12">
          <ContinueButton to="ch-05" />
        </div>
      </div>
    </Section>
  );
}
