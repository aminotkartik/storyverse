import { useEffect, useState } from "react";
import { Section, Folio, Reveal } from "../bits";

const PROMISES = [
  "I won't block a footpath.",
  "I won't park on an accessibility ramp.",
  "I won't stop on a zebra crossing.",
  "I won't honk at someone who needs more time.",
  "I'll leave public spaces better than I found them.",
];

const KEY = "fifteen-seconds-notes";
const MAX_NOTES = 8;

// Notes stay in this browser only (localStorage). No account, no backend, no sharing.
function loadNotes(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string").slice(-MAX_NOTES) : [];
  } catch {
    return [];
  }
}

export default function Pledge() {
  const [notes, setNotes] = useState<string[]>(loadNotes);
  const [status, setStatus] = useState("Your note stays in this browser. No account. No leaderboard.");

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(notes));
    } catch {
      setStatus("Couldn't save to this browser, but your note is on the wall for now.");
    }
  }, [notes]);

  const promise = (text: string) => {
    setNotes((n) => [...n, text].slice(-MAX_NOTES));
    setStatus("Added to the wall on this device.");
  };

  return (
    <Section id="pledge" className="paper-tex text-ink">
      <div className="mx-auto max-w-5xl px-5 py-20 md:px-10">
        <Folio n="→" title="YOUR NOTE" light />
        <Reveal>
          <h2 className="chapter-title mt-6">Choose one.<br /><span className="text-blood">A small promise.</span></h2>
          <p className="mt-4 max-w-xl text-lg">Not as a badge. As a small promise to someone you may never meet.</p>
        </Reveal>

        <div className="mt-8 grid gap-3 md:grid-cols-2" role="group" aria-label="Choose a small civic promise">
          {PROMISES.map((p) => (
            <button key={p} type="button" className="btn-ghost justify-start normal-case tracking-normal font-body text-base text-left" onClick={() => promise(p)}>
              {p}
            </button>
          ))}
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <p className="font-display tracking-widest text-sm">NOTES LEFT ON THIS DEVICE</p>
            <p className="font-display tracking-widest text-sm">{notes.length} / {MAX_NOTES}</p>
          </div>
          <ul className="mt-4 grid gap-5 md:grid-cols-2" aria-live="polite" aria-label="Anonymous promises saved on this device">
            {notes.map((n, i) => (
              <li
                key={`${i}-${n}`}
                className="note bubble-in p-5 font-hand text-lg"
                style={{ transform: `rotate(${i % 2 ? 1.2 : -1.2}deg)` }}
              >
                {n}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink/70">{status}</p>
        </div>
      </div>
    </Section>
  );
}
