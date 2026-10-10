import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { Section, Folio, ContinueButton } from "../bits";
import { sound } from "../audio";

const BEATS = [
  "07:02 — A scooter is parked on the footpath beside the poster. Nobody reads it.",
  "07:19 — A driver reads it, pulls back from the crossing and lets a man with a crutch go first.",
  "07:25 — Dadu crosses in the full fifteen seconds. Nobody has to run.",
];

// Chapter 07 — drag the poster onto the notice board, or tap the button to place it.
export default function Ch07Poster() {
  const boardRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [placed, setPlaced] = useState(false);
  const [beat, setBeat] = useState(-1);

  const place = () => {
    if (placed) return;
    setPlaced(true);
    sound.thud();
  };

  // Morning beats appear one after another once the poster is up.
  useEffect(() => {
    if (!placed) return;
    setBeat(0);
    const ids: number[] = [];
    for (let i = 1; i < BEATS.length; i++) {
      ids.push(window.setTimeout(() => setBeat(i), i * 2200));
    }
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [placed]);

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (placed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    setPos({ x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy });
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || !posterRef.current || !boardRef.current) return;
    const pr = posterRef.current.getBoundingClientRect();
    const br = boardRef.current.getBoundingClientRect();
    const cx = (pr.left + pr.right) / 2;
    const cy = (pr.top + pr.bottom) / 2;
    if (cx > br.left && cx < br.right && cy > br.top && cy < br.bottom) place();
    else setPos({ x: 0, y: 0 });
  };

  return (
    <Section id="ch-07" n="07" title="GIVE THEM 15 SECONDS" className="bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-5 py-20 md:px-10">
        <Folio n="07" title="GIVE THEM 15 SECONDS" />

        <div className="mt-8 grid items-start gap-10 md:grid-cols-2">
          <div>
            <p className="font-hand text-lg text-paper/80">Pick it up. Paste it where people will see it.</p>
            <div
              ref={posterRef}
              role="group"
              aria-label="Campaign poster. Drag it to the notice board, or use the button."
              className={`poster mt-4 w-full max-w-sm select-none p-6 text-ink ${placed ? "opacity-0 pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}
              style={{ transform: `translate(${pos.x}px, ${pos.y}px) rotate(-2deg)`, touchAction: "none" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <p className="font-display text-4xl uppercase leading-none">Give them 15 seconds</p>
              <p className="mt-3 font-body text-lg">Stop on the stripes. Make room on the ramp. Wait for the slowest step.</p>
              <p className="mt-4 font-hand text-sm">Crossing 14A · shared streets</p>
            </div>
            {!placed && (
              <button type="button" className="btn-paper mt-6" onClick={place}>
                Paste it on the board
              </button>
            )}
          </div>

          <div ref={boardRef} className={`board-dashed min-h-[20rem] p-5 ${placed ? "" : "opacity-90"}`} aria-label="Notice board">
            <p className="font-display text-sm tracking-widest text-paper/60">NOTICE BOARD · CROSSING 14A</p>
            {placed && (
              <div className="poster mt-4 w-full max-w-xs p-5 text-ink" style={{ transform: "rotate(2deg)" }}>
                <p className="font-display text-3xl uppercase leading-none">Give them 15 seconds</p>
                <p className="mt-2 font-body">Stop on the stripes. Make room on the ramp.</p>
              </div>
            )}
            <ol className="mt-6 space-y-3" aria-live="polite">
              {placed && BEATS.slice(0, beat + 1).map((b) => (
                <li key={b} className="bubble bubble-in p-3 font-body text-base">{b}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-12">
          <ContinueButton to="ch-08" />
        </div>
      </div>
    </Section>
  );
}
