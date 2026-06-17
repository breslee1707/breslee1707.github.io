import { background, awards } from "../data/content";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function Background() {
  return (
    <Section
      id="background"
      index="02"
      label="Background"
      title="Calm engineering for ambitious AI products."
      intro="I care about the full path from model behavior to interfaces, infrastructure, evaluation, and user trust — designing systems reliable enough for real users, not just demos."
    >
      {/* Disciplines — rule-separated columns, not boxed cards */}
      <ul className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
        {background.disciplines.map((d, i) => (
          <li key={d.key}>
            <Reveal delay={i * 90} className="h-full">
              <div className="flex h-full flex-col bg-bg p-7 md:p-8">
                <span className="label tabular-nums text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-xl tracking-[-0.02em]">{d.key}</h3>
                <p className="mt-3 text-[0.98rem] text-muted">{d.body}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      {/* Recognition */}
      <div className="mt-16">
        <div className="flex items-baseline gap-4">
          <span className="label text-accent">◆</span>
          <span className="label">Proof &amp; recognition</span>
        </div>
        <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
          {awards.map((a, i) => (
            <Reveal key={a.title} delay={i * 90} as="article" className="h-full">
              <div className="group flex h-full flex-col bg-bg">
                <div className="overflow-hidden border-b border-line bg-surface">
                  <img
                    src={a.image}
                    alt={a.imageAlt}
                    width={800}
                    height={500}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-contain"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7 md:p-9">
                  <p className="label">{a.meta}</p>
                  <h3 className="mt-4 text-2xl tracking-[-0.02em] md:text-[1.7rem]">
                    {a.title}
                  </h3>
                  <p className="mt-4 text-[0.98rem] text-muted">{a.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {a.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-line px-3 py-1 font-mono text-xs text-faint"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
