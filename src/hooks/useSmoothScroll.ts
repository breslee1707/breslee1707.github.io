import { useEffect } from "react";

/**
 * Inertial wheel scrolling (Lenis) for mouse/trackpad visitors. It still moves
 * the native scroll position, so sticky stages, IntersectionObservers and the
 * scroll listeners elsewhere keep working. Skipped for touch and reduced
 * motion; loaded lazily so it never weighs on first paint.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let cancelled = false;
    let destroy: (() => void) | undefined;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({
        autoRaf: true,
        lerp: 0.12,
        // In-page links glide too, landing below the sticky nav.
        anchors: { offset: -84 },
        allowNestedScroll: true,
      });
      destroy = () => lenis.destroy();
    });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);
}
