import { useEffect, useRef, useState } from "react";

type Options = {
  /**
   * "pin"  — 0→1 while a tall element scrolls past the top of the viewport
   *          (sticky stages: progress spans its height minus one viewport).
   * "pass" — 0 as the element's top enters at the bottom → 1 as its bottom
   *          leaves at the top.
   */
  mode?: "pin" | "pass";
  /** Custom property written on the element every frame. */
  cssVar?: string;
  /** Per-frame hook for derived values (extra CSS vars, canvas uniforms). */
  onProgress?: (p: number, el: HTMLElement) => void;
};

/**
 * Scroll-linked progress for the referenced element. Driven by native scroll
 * (no wheel hijacking), rAF-throttled, and written straight to a CSS custom
 * property plus a ref — no React re-render per frame, so canvases can read
 * `progress.current` inside their own render loop.
 *
 * Honours `prefers-reduced-motion`: nothing is attached and `reduced` flips
 * to true so callers can render a static composition instead.
 */
export function useScrollProgress<T extends HTMLElement>({
  mode = "pin",
  cssVar = "--p",
  onProgress,
}: Options = {}) {
  const ref = useRef<T>(null);
  const progress = useRef(0);
  const callback = useRef(onProgress);
  // Detected after mount so the prerendered and hydrated markup match.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    callback.current = onProgress;
  });

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
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p: number;
      if (mode === "pin") {
        const total = rect.height - vh;
        p = total > 0 ? -rect.top / total : 0;
      } else {
        p = (vh - rect.top) / (vh + rect.height);
      }
      p = Math.min(Math.max(p, 0), 1);
      progress.current = p;
      el.style.setProperty(cssVar, p.toFixed(4));
      callback.current?.(p, el);
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
  }, [reduced, mode, cssVar]);

  return { ref, progress, reduced };
}

/** Remap p from [a, b] to [0, 1], clamped. */
export const segment = (p: number, a: number, b: number) =>
  Math.min(Math.max((p - a) / (b - a), 0), 1);
