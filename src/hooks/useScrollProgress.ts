import { useEffect, useRef, useState } from "react";

/**
 * Reports 0→1 progress as the referenced element scrolls through its own
 * height past the top of the viewport. Driven by native scroll (no wheel
 * hijacking), rAF-throttled so it only sets state once per frame.
 *
 * Honours `prefers-reduced-motion`: progress stays at 0 and no listeners are
 * attached, so callers can render a static composition instead.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  // Detected after mount so the prerendered and hydrated markup match.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    let raf = 0;
    const measure = () => {
      raf = 0;
      const total = el.offsetHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top;
      const p = total > 0 ? Math.min(Math.max(-top / total, 0), 1) : 0;
      setProgress(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return { ref, progress, reduced };
}
