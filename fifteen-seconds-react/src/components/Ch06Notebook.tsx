import { useEffect, useState } from "react";
import { Section, Folio, ContinueButton } from "../bits";
import { sound } from "../audio";
import { useStory } from "../store";

const OBSERVATIONS = [
  "A scooter on the footpath means a wheelchair goes into the road.",
  "A ramp with a car parked on it is not a ramp.",
  "A zebra crossing is a promise. Stopping on it breaks the promise.",
  "Honking at someone who is slow doesn't make them faster.",
  "The bin in the middle of the walkway is a choice someone made.",
];

const TALLY = [
  { label: "Blocked ramps counted", value: 17 },
  { label: "Footpaths with a vehicle on them", value: 23 },
  { label: "Zebra crossings occupied", value: 9 },
  { label: "Seconds taken from strangers", value: 214 },
];

// Count up from 0 to target once the tally page is shown.
function useCountUp(target: number, active: boolean, reduced: boolean) {
  const [v, setV] = useState(active && reduced ? target : 0);
  useEffect(() => {
    if (!active) return;
    if (reduced) { setV(target); return; }
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const id = window.setInterval(() => {
      cur = Math.min(target, cur + step);
      setV(cur);
      if (cur >= target) window.clearInterval(id);
    }, 40);
    return () => window.clearInterval(id);
  }, [active, target, reduced]);
  return v;
}

function Tally({ active, reduced }: { active: boolean; reduced: boolean }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {TALLY.map((t) => (
        <TallyRow key={t.label} label={t.label} target={t.value} active={active} reduced={reduced} />
      ))}
    </ul>
  );
}

function TallyRow({ label, target, active, reduced }: { label: string; target: number; active: boolean; reduced: boolean }) {
  const v = useCountUp(target, active, reduced);
  return (
    <li className="ink-panel p-4">
      <p className="count count-pop text-6xl">{v}</p>
      <p className="mt-1 font-body text-ink/80">{label}</p>
    </li>
  );
}

// Chapter 06 — a flippable field notebook, then the tally accumulates.
export default function Ch06Notebook() {
  const { state } = useStory();
  const [page, setPage] = useState(0);
  const onTally = page === OBSERVATIONS.length;

  const turn = (dir: 1 | -1) => {
    const next = Math.min(OBSERVATIONS.length, Math.max(0, page + dir));
    if (next !== page) {
      sound.page();
      setPage(next);
    }
  };

  return (
    <Section id="ch-06" n="06" title="THE NUMBERS" className="paper-tex text-ink">
      <div className="mx-auto max-w-4xl px-5 py-20 md:px-10">
        <Folio n="06" title="THE NUMBERS" light />

        <div className="notebook mt-8 p-6 md:p-10 min-h-[18rem]" role="region" aria-label="Field notebook">
          <p className="font-hand text-sm text-ink/60">Tara's field notes · page {onTally ? "tally" : page + 1} of {OBSERVATIONS.length + 1}</p>
          <div key={page} className="page-turn mt-4">
            {!onTally ? (
              <p className="font-hand text-2xl leading-relaxed">{OBSERVATIONS[page]}</p>
            ) : (
              <>
                <p className="font-display text-3xl uppercase">One month, one bus stop.</p>
                <p className="mt-2 text-sm text-ink/70">Tara's own tally. A narrative example, not a city survey.</p>
                <div className="mt-6">
                  <Tally active={onTally} reduced={!state.motionOK} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button type="button" className="btn-ghost" onClick={() => turn(-1)} disabled={page === 0}>Prev</button>
          <button type="button" className="btn-ink" onClick={() => turn(1)} disabled={onTally}>Next</button>
        </div>

        <div className="mt-12">
          <ContinueButton to="ch-07" light />
        </div>
      </div>
    </Section>
  );
}
