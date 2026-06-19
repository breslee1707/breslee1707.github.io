import { projects } from "../data/content";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { TechBadge } from "./TechBadge";
import { ProjectMotif } from "./ProjectMotif";

export function Work() {
  return (
    <Section
      id="work"
      index="03"
      label="Selected work"
      title="Systems across language, vision, robotics, and automation."
      intro="Shaped from real engineering experience — each can be expanded into a full case study with demos and source as it matures."
    >
      <ol className="border-t border-line">
        {projects.map((p, i) => (
          <Reveal key={p.title} as="li" delay={i * 60}>
            <article className="group relative grid gap-5 overflow-hidden border-b border-line py-9 transition-colors duration-300 md:grid-cols-[7rem_1fr] md:gap-10 md:py-11">
              <ProjectMotif name={p.motif} className="project-motif" />

              <div className="relative z-10 flex items-center gap-4 md:flex-col md:items-start md:gap-3">
                <span className="font-display text-3xl font-bold tabular-nums text-line transition-colors duration-300 group-hover:text-accent md:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="label md:mt-1">{p.meta}</p>
              </div>

              <div className="relative z-10">
                {p.status ? (
                  <p className="mb-3 inline-flex items-center gap-2 label text-accent">
                    <span
                      className="size-1.5 rounded-full bg-accent animate-pulse motion-reduce:animate-none"
                      aria-hidden
                    />
                    {p.status}
                  </p>
                ) : null}
                <h3 className="text-2xl tracking-[-0.02em] md:text-[1.9rem]">
                  {p.title}
                </h3>
                <p className="measure mt-4 text-muted">{p.body}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <TechBadge key={t} label={t} className="px-3 py-1 text-xs" />
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
