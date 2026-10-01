import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { projects } from "../data/content";
import { useCan3D } from "../hooks/useCan3D";
import { ProjectMotif } from "./ProjectMotif";
import { Section } from "./Section";
import { TechBadge } from "./TechBadge";

const ExhibitStage = lazy(() => import("../three/ExhibitStage"));

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Selected work as a sequence of exhibits: the copy scrolls on the left while
 * a sticky stage draws the project being read in 3D (a top band on small
 * screens). Without WebGL the stage shows the project's 2D line-art instead.
 */
export function Work() {
  const can3D = useCan3D();
  const [active, setActive] = useState(0);
  const stepsRef = useRef<HTMLOListElement>(null);

  // The step crossing the viewport's middle line is the one being read.
  useEffect(() => {
    const steps = stepsRef.current?.querySelectorAll<HTMLElement>("[data-step]");
    if (!steps?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    steps.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const current = projects[active];

  return (
    <Section
      id="work"
      index="03"
      label="Selected work"
      title="Systems across language, vision, robotics, and automation."
      intro="Shaped from real engineering experience — each exhibit is drawn live from what the system actually does."
      wide
    >
      <div className="exhibits">
        <ol ref={stepsRef} className="exhibit-steps">
          {projects.map((p, i) => (
            <li
              key={p.title}
              data-step={i}
              data-active={i === active ? "" : undefined}
              className="exhibit-step"
            >
              <article className="exhibit-copy">
                <div className="flex items-end gap-4">
                  <span className="exhibit-num" aria-hidden>
                    {pad(i + 1)}
                  </span>
                  <p className="label pb-1">{p.meta}</p>
                </div>
                {p.status ? (
                  <p className="mt-7 inline-flex items-center gap-2 label text-accent">
                    <span
                      className="size-1.5 rounded-full bg-accent animate-pulse motion-reduce:animate-none"
                      aria-hidden
                    />
                    {p.status}
                  </p>
                ) : null}
                <h3 className="mt-5 text-[clamp(1.75rem,3.1vw,2.5rem)] leading-[1.02] tracking-[-0.03em]">
                  {p.title}
                </h3>
                <p className="mt-5 max-w-[46ch] text-muted">{p.body}</p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <TechBadge key={t} label={t} className="px-2.5 py-1 text-xs" />
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>

        <div className="exhibit-stage-wrap">
          <div className="exhibit-stage">
            {can3D ? (
              <Suspense fallback={null}>
                <ExhibitStage active={active} />
              </Suspense>
            ) : (
              <ProjectMotif
                key={current.motif}
                name={current.motif}
                align="xMidYMid meet"
                className="exhibit-motif"
              />
            )}
            <span className="crop-marks" aria-hidden />
          </div>
        </div>
      </div>
    </Section>
  );
}
