import { useEffect, useId, useState } from "react";
import { useStory, CHAPTERS } from "../store";
import { Folio } from "../bits";

export default function Hud() {
  const { state, dispatch } = useStory();
  const [menu, setMenu] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <header className="hud hud-ui fixed inset-x-0 top-0 z-[70] flex items-center justify-between gap-3 px-3 py-2 md:px-5">
      <Folio n={state.chapterN} title={state.chapterTitle || "FIFTEEN SECONDS"} />

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-ghost text-xs bg-ink/80"
          aria-pressed={state.motionOK}
          onClick={() => dispatch({ type: "motion", v: !state.motionOK })}
        >
          Motion {state.motionOK ? "on" : "off"}
        </button>
        <button
          type="button"
          className="btn-ghost text-xs bg-ink/80"
          aria-pressed={state.soundOn}
          onClick={() => dispatch({ type: "sound", v: !state.soundOn })}
        >
          Sound {state.soundOn ? "on" : "off"}
        </button>
        <button
          type="button"
          className="btn-ghost text-xs bg-ink/80"
          aria-expanded={menu}
          aria-controls={menuId}
          onClick={() => setMenu((m) => !m)}
        >
          Chapters
        </button>
      </div>

      {menu && (
        <nav id={menuId} aria-label="Chapters" className="absolute right-3 top-full mt-2 w-72 bg-ink border-2 border-paper/80 shadow-[6px_6px_0_rgba(239,233,219,.2)]">
          <ul>
            {CHAPTERS.map((c) => (
              <li key={c.id}>
                <a href={`#${c.id}`} className="menu-link text-paper" onClick={() => setMenu(false)}>
                  <span className="text-blood">{c.n}</span> {c.title}
                </a>
              </li>
            ))}
            <li><a href="#pledge" className="menu-link text-paper" onClick={() => setMenu(false)}>Your note</a></li>
            <li><a href="#finale" className="menu-link text-paper" onClick={() => setMenu(false)}>Again</a></li>
          </ul>
          <p className="border-t border-paper/20 px-3 py-2 text-xs text-paper/60">
            <kbd>P</kbd> presentation mode · <kbd>E</kbd> restart · <kbd>Esc</kbd> close
          </p>
        </nav>
      )}
    </header>
  );
}
