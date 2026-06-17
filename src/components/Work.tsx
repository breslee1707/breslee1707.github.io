import { ArrowUpRight } from "lucide-react";
import { projects, labLink } from "../data/content";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

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
            <article className="group grid gap-5 border-b border-line py-9 transition-colors duration-300 md:grid-cols-[7rem_1fr] md:gap-10 md:py-11">
              <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-3">
                <span className="font-display text-3xl font-bold tabular-nums text-line transition-colors duration-300 group-hover:text-accent md:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="label md:mt-1">{p.meta}</p>
              </div>

              <div>
                <h3 className="text-2xl tracking-[-0.02em] md:text-[1.9rem]">
                  {p.title}
                </h3>
                <p className="measure mt-4 text-muted">{p.body}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-line px-3 py-1 font-mono text-xs text-faint transition-colors duration-300 group-hover:border-line"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </ol>

      <Reveal>
        <a
          href={labLink.href}
          className="group mt-10 flex flex-col gap-2 rounded-lg border border-line p-7 transition-colors duration-300 hover:border-accent md:flex-row md:items-center md:justify-between md:p-8"
        >
          <div>
            <p className="label text-accent">Lab notes</p>
            <h3 className="mt-3 text-xl tracking-[-0.02em]">{labLink.label}</h3>
            <p className="mt-2 text-muted">{labLink.note}</p>
          </div>
          <ArrowUpRight
            size={28}
            strokeWidth={1.5}
            className="shrink-0 text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
            aria-hidden
          />
        </a>
      </Reveal>
    </Section>
  );
}
