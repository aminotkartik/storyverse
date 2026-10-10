import { Section, Folio } from "../bits";
import { useStory } from "../store";
import { scrollToId } from "../hooks";

// Finale / Again — closes the loop back to the crossing.
export default function Finale() {
  const { state } = useStory();
  return (
    <Section id="finale" className="bg-ink text-paper">
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-5 py-20 text-center">
        <Folio n="→" title="AGAIN" />
        <p className="font-display text-[clamp(2.5rem,9vw,7rem)] uppercase leading-[.95]">
          The light turns green.<br />
          <span className="text-amber">The city is still learning.</span>
        </p>
        <p className="max-w-md font-hand text-lg text-paper/70">Fifteen seconds is what the signal gives. Fair is what we give each other.</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button type="button" className="btn-paper" onClick={() => scrollToId("ch-01", state.motionOK)}>Replay the crossing</button>
          <button type="button" className="btn-ghost" onClick={() => scrollToId("intro", state.motionOK)}>Back to the start</button>
        </div>
        <p className="font-display text-xs tracking-widest text-paper/40">FIFTEEN SECONDS · A STORYVERSE PROJECT · SDG 11</p>
      </div>
    </Section>
  );
}
