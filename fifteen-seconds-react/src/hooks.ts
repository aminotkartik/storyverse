import { useEffect, useState, type RefObject } from "react";
import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}

// 0..1 progress of a tall wrapper that contains a sticky 100vh child.
export function useProgress(ref: RefObject<HTMLElement | null>): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        const v = total <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / total));
        setP((prev) => (Math.abs(prev - v) > 0.0015 ? v : prev));
      }
      raf = requestAnimationFrame(calc);
    };
    raf = requestAnimationFrame(calc);
    return () => cancelAnimationFrame(raf);
  }, [ref]);
  return p;
}

// Fires once when the element enters the viewport.
export function useInView(ref: RefObject<HTMLElement | null>, margin = "-18% 0px"): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }),
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return on;
}

// Smooth-scrolls to an element id (uses Lenis when available).
export function scrollToId(id: string, motionOK = true) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = window.__lenis;
  if (lenis && motionOK) lenis.scrollTo(el, { duration: 1.6 });
  else el.scrollIntoView({ behavior: motionOK ? "smooth" : "auto", block: "start" });
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a)); // remaps p from [a,b] to [0,1]
