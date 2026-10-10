import { useState } from "react";
import { Section, Folio, Reveal, ContinueButton } from "../bits";
import { IMG } from "../images";
import { sound } from "../audio";

const CLUES = [
  { x: 27, y: 79, title: "A scooter on the footpath", text: "The footpath is the only route for someone with a walker or a wheelchair. Here it's parked on." },
  { x: 15, y: 55, title: "The horn as a threat", text: "A driver leans out with a megaphone-style horn. Pressure, not patience, is what the people ahead get." },
  { x: 64, y: 68, title: "A car over the crossing", text: "The white stripes promise the people on the kerb a safe way across. This car has broken that promise." },
  { x: 38, y: 58, title: "Seating spilling onto the walkway", text: "The stall's benches have turned the footpath into a single, narrow path that can't be shared." },
  { x: 77, y: 86, title: "Litter beside a full bin", text: "A bin in the wrong place, and the rubbish beside it. Small, normal, and everyone walks around it." },
];

// Chapter 03 — five hidden civic harms. Each hotspot reveals a piece of evidence.
export default function Ch03LookAgain() {
  const [found, setFound] = useState<boolean[]>(CLUES.map(() => false));
  const [open, setOpen] = useState<number | null>(null);
  const count = found.filter(Boolean).length;

  const reveal = (i: number) => {
    setOpen(i);
    if (!found[i]) {
      sound.chirp();
      setFound((f) => f.map((v, j) => (j === i ? true : v)));
    }
  };

  return (
    <Section id="ch-03" n="03" title="LOOK AGAIN" className="bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-10">
        <Folio n="03" title="LOOK AGAIN" />
        <Reveal>
          <h2 className="chapter-title mt-6">Nothing here<br /><em className="text-amber not-italic">looks exceptional.</em></h2>
          <p className="mt-4 max-w-xl text-lg text-paper/80">Tap the numbered marks. Each one is a small harm that everyone in this street has learned to walk around.</p>
        </Reveal>

        <div className="relative mt-10 overflow-hidden border-[3px] border-paper">
          <img
            src={IMG.street}
            alt="A busy Indian street: a scooter on the footpath, a driver with a megaphone-style horn, a car over the crossing, a stall's benches on the walkway and litter beside a bin."
            className="block h-auto w-full"
            loading="lazy"
            width={1376}
            height={768}
          />
          {CLUES.map((c, i) => (
            <button
              key={c.title}
              type="button"
              className={`hotspot ${found[i] ? "hotspot--found" : ""}`}
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              onClick={() => reveal(i)}
              aria-label={`Clue ${i + 1}: ${found[i] ? c.title : "unrevealed"}`}
              aria-pressed={open === i}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <p className="mt-4 font-display tracking-widest text-amber" aria-live="polite">
          {count} / {CLUES.length} FOUND
        </p>

        {open !== null && (
          <div className="bubble bubble--up bubble-in mt-6 max-w-xl p-5">
            <p className="font-display text-xl uppercase">{CLUES[open].title}</p>
            <p className="mt-2 font-body text-lg">{CLUES[open].text}</p>
          </div>
        )}

        <div className="mt-12">
          <ContinueButton to="ch-04" />
        </div>
      </div>
    </Section>
  );
}
