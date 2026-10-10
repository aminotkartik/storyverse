import { useEffect, useState } from "react";
import { Section, Folio, Reveal, ContinueButton } from "../bits";

const SIGNAL_MS = 15_000;

const PEOPLE = [
  { id: "tara", name: "Tara, 19", needS: 6, line: "A comfortable walk. The light is more than enough." },
  { id: "child", name: "A child, 7", needS: 9, line: "Small steps, a bag bigger than her, and a crowd that doesn't wait." },
  { id: "stroller", name: "A parent with a stroller", needS: 12, line: "The ramp is blocked by a parked scooter, so it's the long way round." },
  { id: "dadu", name: "Dadu, 72", needS: 19, line: "Needs a rest on the median. The light turns before he reaches the far kerb." },
  { id: "wheel", name: "A wheelchair user", needS: 23, line: "Two blocked ramps and a detour into the road." },
];

// Chapter 02 — everyone gets the same 15 seconds. Pick someone to replay the crossing at their pace.
export default function Ch02Compare() {
  const [sel, setSel] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const person = sel === null ? null : PEOPLE[sel];
  const finish = person ? Math.min(person.needS * 1000, SIGNAL_MS) : 0;
  const crossed = person ? person.needS * 1000 <= SIGNAL_MS : false;
  const ended = person !== null && elapsed >= finish;

  useEffect(() => {
    if (sel === null) return;
    const target = Math.min(PEOPLE[sel].needS * 1000, SIGNAL_MS);
    const t0 = performance.now();
    setElapsed(0);
    const id = window.setInterval(() => {
      const e = Math.min(target, performance.now() - t0);
      setElapsed(e);
      if (e >= target) window.clearInterval(id);
    }, 50);
    return () => window.clearInterval(id);
  }, [sel, run]);

  const pick = (i: number) => {
    setSel(i);
    setRun((r) => r + 1);
  };

  return (
    <Section id="ch-02" n="02" title="FIFTEEN SECONDS" className="paper-tex text-ink">
      <div className="mx-auto max-w-5xl px-5 py-20 md:px-10">
        <Folio n="02" title="FIFTEEN SECONDS" light />
        <Reveal>
          <h2 className="chapter-title mt-6">Everyone gets<br /><span className="text-blood">fifteen.</span></h2>
          <p className="mt-4 max-w-xl font-body text-lg">The same signal, the same seconds. Pick someone to walk the crossing at their own pace.</p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {PEOPLE.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={sel === i}
              onClick={() => pick(i)}
              className={`text-left ink-panel p-4 transition-transform hover:-translate-y-0.5 ${sel === i ? "bg-white" : ""}`}
            >
              <span className="font-display text-xl uppercase tracking-wide">{p.name}</span>
              <span className="mt-1 block text-sm text-ink/70">{p.line}</span>
              <span className="mt-3 block font-hand text-sm">Needs about {p.needS} seconds</span>
            </button>
          ))}
        </div>

        <div className="ink-panel mt-8 p-5" aria-live="polite">
          {person === null ? (
            <p className="font-hand text-lg">Choose a person above to start the same fifteen seconds.</p>
          ) : (
            <>
              <p className="font-display text-lg uppercase">{person.name}</p>
              <div className="mt-3 h-6 w-full border-[3px] border-ink bg-paper" role="img" aria-label={`Progress ${Math.round((elapsed / (person.needS * 1000)) * 100)} percent`}>
                <div className="h-full bg-ink" style={{ width: `${Math.min(100, (elapsed / (person.needS * 1000)) * 100)}%` }} />
              </div>
              <div className="mt-3 h-4 w-full border-2 border-blood bg-paper">
                <div className="h-full bg-blood" style={{ width: `${Math.min(100, (elapsed / SIGNAL_MS) * 100)}%` }} />
              </div>
              <p className="mt-2 text-sm text-ink/70">Black: this person's crossing. Red: the signal, 15 seconds.</p>
              <p className="mt-4 font-hand text-lg">
                {ended
                  ? crossed
                    ? `Crossed in ${person.needS} seconds. Equal time, and this crossing worked.`
                    : "The light changed with them still on the road. Same time. Not fair."
                  : "Crossing…"}
              </p>
              {ended && (
                <button type="button" className="btn-ink mt-4" onClick={() => pick(sel!)}>Replay at this pace</button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-5 pb-16 md:px-10">
        <ContinueButton to="ch-03" light />
      </div>
    </Section>
  );
}
