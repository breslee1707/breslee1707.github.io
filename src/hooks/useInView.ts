import { useEffect, useState, type RefObject } from "react";

/** Tracks whether an element intersects the viewport (grown by rootMargin). */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  rootMargin = "0px",
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
