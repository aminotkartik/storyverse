// Shared manga furniture: section scaffolding, folios, reveals, continue buttons.
import { useRef, type ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { useInView, scrollToId } from "./hooks";
import { useStory } from "./store";

export function Section({
  id,
  n,
  title,
  className = "",
  children,
}: {
  id: string;
  n?: string;
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} data-chapter={n} data-title={title} className={`relative ${className}`}>
      {children}
    </section>
  );
}

// Manga pagination stamp: "03 / 10 — LOOK AGAIN"
export function Folio({ n, title, light = false }: { n: string; title: string; light?: boolean }) {
  return (
    <div className={`folio ${light ? "text-ink bg-paper" : "text-paper bg-ink"} relative z-20`}>
      <span className="text-blood">{n}</span>
      <span className="opacity-50">/</span>
      <span className="opacity-50">10</span>
      <span className="w-2" />
      <span>{title}</span>
    </div>
  );
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref);
  return (
    <div ref={ref} className={`rv ${on ? "on" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function ContinueButton({ to, label = "TURN THE PAGE", light = false }: { to: string; label?: string; light?: boolean }) {
  const { state } = useStory();
  return (
    <button
      type="button"
      onClick={() => scrollToId(to, state.motionOK)}
      className={`continue-btn ${light ? "btn-ink" : "btn-paper"} group`}
      aria-label={`${label} — continue to the next chapter`}
    >
      <span>{label}</span>
      <ArrowDown size={18} className="transition-transform duration-300 group-hover:translate-y-1" aria-hidden />
    </button>
  );
}

export function Halftone({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return <div aria-hidden className={`pointer-events-none absolute inset-0 ${light ? "halftone--light" : "halftone"} ${className}`} />;
}
