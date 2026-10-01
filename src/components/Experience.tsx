import { useEffect } from "react";
import { experience } from "../data/content";
import { segment, useScrollProgress } from "../hooks/useScrollProgress";
import { CompanyLogo } from "./CompanyLogo";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

/**
 * Experience as a rail: an ochre line fills as the list scrolls past, and
 * each role's node lights once the reader reaches it. The current role pulses.
 */
export function Experience() {
  const { ref } = useScrollProgress<HTMLOListElement>({
    mode: "pass",
    onProgress: (p, el) => el.style.setProperty("--fill", segment(p, 0.16, 0.66).toFixed(4)),
  });

  // A node lights when its role has scrolled above 55% of the viewport.
  useEffect(() => {
    const items = ref.current?.querySelectorAll<HTMLElement>("[data-role]");
    if (!items?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const reached = e.boundingClientRect.top < (e.rootBounds?.bottom ?? 0);
          (e.target as HTMLElement).toggleAttribute("data-lit", reached);
        }
      },
      { rootMargin: "0px 0px -45% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ref]);

  return (
    <Section
      id="experience"
      index="05"
      label="Experience"
      title="From robotics research to applied AI engineering."
    >
      <ol ref={ref} className="rail">
        {experience.map((role, i) => (
          <Reveal
            key={`${role.org}-${role.title}`}
            as="li"
            delay={i * 60}
            className="rail-item"
          >
            <div data-role data-current={role.current ? "" : undefined} className="rail-row">
              <span className="rail-node" aria-hidden />
              <div className="flex items-center gap-3 self-start md:pt-2">
                <span className="label tabular-nums">{role.date}</span>
                {role.current ? <span className="rail-now label">Now</span> : null}
              </div>
              <div className="flex items-start gap-4">
                <CompanyLogo org={role.org} logo={role.logo} />
                <div className="min-w-0">
                  <h3 className="flex flex-wrap items-baseline gap-x-3 text-xl tracking-[-0.02em] md:text-2xl">
                    {role.title}
                    <span className="text-accent">{role.org}</span>
                  </h3>
                  <p className="measure mt-3 text-muted">{role.body}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
