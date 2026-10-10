import { useState } from "react";
import { Section, Folio, ContinueButton } from "../bits";
import { sound } from "../audio";

type Option = { text: string; considerate: boolean; consequence: string; chain: string };
type Step = { prompt: string; options: Option[] };

const STEPS: Step[] = [
  {
    prompt: "The footpath near the chai stall is clear. Your scooter needs somewhere to stop.",
    options: [
      { text: "Park it on the footpath, just for a minute.", considerate: false, consequence: "A wheelchair user has to go into the road to pass.", chain: "" },
      { text: "Use the proper parking strip, even if it's a longer walk.", considerate: true, consequence: "", chain: "The footpath stays clear for a mother with a pram." },
    ],
  },
  {
    prompt: "A car is stopped on the zebra crossing ahead. You're behind it.",
    options: [
      { text: "Honk until they move.", considerate: false, consequence: "The driver flinches. The person waiting at the kerb flinches too, and is still waiting.", chain: "" },
      { text: "Wait a moment, then ask them politely to clear the stripes.", considerate: true, consequence: "", chain: "Two people see it can be done, and the car moves." },
    ],
  },
  {
    prompt: "A slower person is at the signal, and the light is counting down.",
    options: [
      { text: "Walk past them, quickly.", considerate: false, consequence: "They now have less time, and no one saw it happen.", chain: "" },
      { text: "Wait with them and cross at their pace.", considerate: true, consequence: "", chain: "The crossing becomes a shared fifteen seconds." },
    ],
  },
];

// Chapter 08 — three small choices. No score: a visible chain reaction instead.
export default function Ch08SecondPerson() {
  const [step, setStep] = useState(0);
  const [chain, setChain] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const done = step >= STEPS.length;

  const choose = (o: Option) => {
    if (o.considerate) {
      sound.chirp();
      setChain((c) => [...c, o.chain]);
      setWarning(null);
      setStep((s) => s + 1);
    } else {
      sound.honk(0.6);
      setWarning(o.consequence);
    }
  };

  const reconsider = () => setWarning(null);

  return (
    <Section id="ch-08" n="08" title="THE SECOND PERSON" className="paper-tex text-ink">
      <div className="mx-auto max-w-4xl px-5 py-20 md:px-10">
        <Folio n="08" title="THE SECOND PERSON" light />
        <h2 className="chapter-title mt-6">Three small<br /><span className="text-blood">choices.</span></h2>

        {!done ? (
          <div className="ink-panel mt-8 p-6" aria-live="polite">
            <p className="font-hand text-sm text-ink/60">Choice {step + 1} of {STEPS.length}</p>
            <p className="mt-2 font-body text-xl">{STEPS[step].prompt}</p>
            <div className="mt-5 grid gap-3">
              {STEPS[step].options.map((o) => (
                <button key={o.text} type="button" className="btn-ghost justify-start text-left normal-case tracking-normal font-body text-base" onClick={() => choose(o)}>
                  {o.text}
                </button>
              ))}
            </div>
            {warning && (
              <div className="bubble bubble-in mt-6 p-4" role="status">
                <p className="font-body text-lg">{warning}</p>
                <button type="button" className="btn-ink mt-3" onClick={reconsider}>Reconsider</button>
              </div>
            )}
          </div>
        ) : (
          <div className="ink-panel mt-8 p-6">
            <p className="font-display text-2xl uppercase">The chain</p>
            <ol className="mt-4 space-y-3">
              {chain.map((c) => <li key={c} className="font-body text-lg">→ {c}</li>)}
            </ol>
            <p className="mt-6 font-hand text-lg">One person's action becomes another person's possibility.</p>
            <button type="button" className="btn-ink mt-4" onClick={() => { setStep(0); setChain([]); setWarning(null); }}>Choose again</button>
          </div>
        )}

        <div className="mt-12">
          <ContinueButton to="ch-09" light />
        </div>
      </div>
    </Section>
  );
}
