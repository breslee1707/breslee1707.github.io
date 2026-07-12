import { experience } from "../data/content";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { CompanyLogo } from "./CompanyLogo";

export function Experience() {
  return (
    <Section
      id="experience"
      index="05"
      label="Experience"
      title="From robotics research to applied AI engineering."
    >
      <ol className="relative">
        {experience.map((role, i) => (
          <Reveal key={`${role.org}-${role.title}`} as="li" delay={i * 60}>
            <div className="grid gap-3 border-t border-line py-8 md:grid-cols-[12rem_1fr] md:gap-10 md:py-9">
              <div className="flex items-center gap-3">
                <span
                  className={`size-1.5 rounded-full ${
                    role.current ? "bg-accent" : "bg-faint"
                  }`}
                  aria-hidden
                />
                <span className="label">{role.date}</span>
              </div>
              <div className="flex items-start gap-4">
                <CompanyLogo org={role.org} logo={role.logo} />
                <div className="min-w-0">
                  <h3 className="flex flex-wrap items-baseline gap-x-3 text-xl tracking-[-0.02em] md:text-2xl">
                    {role.title}
                    <span className="text-accent">{role.org}</span>
                    {role.current ? (
                      <span className="rounded-full border border-accent/50 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-accent">
                        Current
                      </span>
                    ) : null}
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
