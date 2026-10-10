import { useEffect, useRef } from "react";
import { useStory } from "../store";

export default function Loader({ onDone }: { onDone: () => void }) {
  const { state } = useStory();
  const doneRef = useRef(onDone);
  useEffect(() => { doneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    const id = window.setTimeout(() => doneRef.current(), state.motionOK ? 1400 : 150);
    return () => window.clearTimeout(id);
  }, [state.motionOK]);

  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-6 bg-ink text-paper">
      <svg viewBox="0 0 78 112" width="78" height="112" aria-hidden className="sig-red">
        <path d="M18 8h42a7 7 0 0 1 7 7v82a7 7 0 0 1-7 7H18a7 7 0 0 1-7-7V15a7 7 0 0 1 7-7Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="39" cy="32" r="12" fill="currentColor" className={state.motionOK ? "flicker" : ""} />
        <circle cx="39" cy="65" r="12" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
      <p className="font-display tracking-widest uppercase text-paper/80">Loading the city…</p>
    </div>
  );
}
