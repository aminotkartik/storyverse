// Global story state: loader, sound, motion preference, presentation mode, current chapter.
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode, type Dispatch } from "react";

export type ChapterInfo = { id: string; n: string; title: string };

export const CHAPTERS: ChapterInfo[] = [
  { id: "ch-01", n: "01", title: "THE CROSSING" },
  { id: "ch-02", n: "02", title: "FIFTEEN SECONDS" },
  { id: "ch-03", n: "03", title: "LOOK AGAIN" },
  { id: "ch-04", n: "04", title: "THE AVERAGE HUMAN" },
  { id: "ch-05", n: "05", title: "THE MIRROR" },
  { id: "ch-06", n: "06", title: "THE NUMBERS" },
  { id: "ch-07", n: "07", title: "GIVE THEM 15 SECONDS" },
  { id: "ch-08", n: "08", title: "THE SECOND PERSON" },
  { id: "ch-09", n: "09", title: "34 SECONDS" },
  { id: "ch-10", n: "10", title: "THE CITY" },
];

export type StoryState = {
  started: boolean;
  began: boolean;
  soundOn: boolean;
  motionOK: boolean;
  present: boolean;
  chapter: number;
  chapterTitle: string;
  chapterN: string;
};

export type StoryAction =
  | { type: "start" }
  | { type: "begin" }
  | { type: "sound"; v: boolean }
  | { type: "motion"; v: boolean }
  | { type: "present"; v: boolean }
  | { type: "chapter"; i: number; n: string; title: string };

const initial: StoryState = {
  started: false,
  began: false,
  soundOn: false,
  motionOK: true,
  present: false,
  chapter: 0,
  chapterTitle: "",
  chapterN: "00",
};

function reducer(s: StoryState, a: StoryAction): StoryState {
  switch (a.type) {
    case "start": return { ...s, started: true };
    case "begin": return s.began ? s : { ...s, began: true };
    case "sound": return { ...s, soundOn: a.v };
    case "motion": return { ...s, motionOK: a.v };
    case "present": return { ...s, present: a.v };
    case "chapter":
      if (s.chapter === a.i && s.chapterTitle === a.title) return s;
      return { ...s, chapter: a.i, chapterTitle: a.title, chapterN: a.n };
    default: return s;
  }
}

type StoryContextValue = { state: StoryState; dispatch: Dispatch<StoryAction> };
const Ctx = createContext<StoryContextValue | null>(null);

export function StoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial, (init): StoryState => {
    const rm = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    return { ...init, motionOK: !rm };
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("rm", !state.motionOK);
    html.classList.toggle("present", state.present);
    document.body.classList.toggle("presentation-mode", state.present);
  }, [state.motionOK, state.present]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStory(): StoryContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStory must be used inside <StoryProvider>");
  return ctx;
}
