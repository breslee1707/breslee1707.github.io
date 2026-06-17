import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently in view.
 * Uses IntersectionObserver against the given section ids.
 */
export function useScrollSpy(ids: string[], offset = "-45% 0px -50% 0px") {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: offset, threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, offset]);

  return active;
}
