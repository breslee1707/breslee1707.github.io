import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  as?: "div" | "li" | "section" | "article";
  className?: string;
};

/**
 * Reveals content on scroll. Content is visible by default;
 * the `.js` class on <html> opts into the hidden→shown transition,
 * so non-JS / headless renders still show everything.
 */
export function Reveal({ children, delay = 0, as = "div", className = "" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.classList.add("is-in");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
