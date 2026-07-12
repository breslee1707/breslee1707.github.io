import { toolkit } from "../data/content";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { TechBadge } from "./TechBadge";

export function Toolkit() {
  return (
    <Section
      id="toolkit"
      index="06"
      label="Toolkit"
      title="The stack behind the work."
      intro="Practical depth across the AI lifecycle — from model behavior to edge deployment."
    >
      <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
        {toolkit.map((g, i) => (
          <Reveal key={g.group} delay={i * 80} className="h-full">
            <div className="flex h-full flex-col bg-bg p-7 md:p-8">
              <div className="flex items-baseline gap-3">
                <span className="label tabular-nums text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg tracking-[-0.01em]">{g.group}</h3>
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <TechBadge key={item} label={item} className="px-2.5 py-1 text-[0.78rem]" />
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
