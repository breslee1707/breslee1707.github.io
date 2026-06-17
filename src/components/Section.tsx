import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type Props = {
  id: string;
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
};

/**
 * A numbered editorial section. The 01–06 markers are a deliberate,
 * site-wide sequence (mirrored in the nav), not per-section scaffolding.
 */
export function Section({ id, index, label, title, intro, children }: Props) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line">
      <div className="mx-auto w-full max-w-[72rem] px-6 py-20 md:px-10 md:py-28">
        <Reveal>
          <div className="flex items-baseline gap-4">
            <span className="label tabular-nums text-accent">{index}</span>
            <span className="label">{label}</span>
          </div>
          <h2 className="mt-6 max-w-[20ch] text-[clamp(2rem,5vw,3.4rem)] tracking-[-0.03em]">
            {title}
          </h2>
          {intro ? (
            <p className="measure mt-6 text-lg text-muted md:text-xl">{intro}</p>
          ) : null}
        </Reveal>

        <div className="mt-14 md:mt-16">{children}</div>
      </div>
    </section>
  );
}
