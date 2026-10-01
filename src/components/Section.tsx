import type { ReactNode } from "react";
import { nav } from "../data/content";
import { Reveal } from "./Reveal";
import { SplitText } from "./SplitText";

type Props = {
  id: string;
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  /** A wider measure for sections with a stage beside the copy. */
  wide?: boolean;
};

const total = String(nav.length).padStart(2, "0");

/**
 * A numbered editorial section. The 01–07 markers are a deliberate,
 * site-wide sequence (mirrored in the nav), set on a ruled header line.
 */
export function Section({ id, index, label, title, intro, children, wide = false }: Props) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line">
      <div
        className={`mx-auto w-full px-6 py-20 md:px-10 md:py-32 ${wide ? "max-w-[84rem]" : "max-w-[72rem]"}`}
      >
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="label tabular-nums text-accent">{index}</span>
            <span className="label">{label}</span>
            <span className="ruler" aria-hidden />
            <span className="label tabular-nums" aria-hidden>
              {index}/{total}
            </span>
          </div>
          <h2 className="mt-8 max-w-[19ch] text-[clamp(2.2rem,5.2vw,4.1rem)] leading-[0.98] tracking-[-0.035em]">
            {typeof title === "string" ? <SplitText text={title} /> : title}
          </h2>
          {intro ? (
            <p className="measure mt-7 text-lg text-muted md:text-xl">{intro}</p>
          ) : null}
        </Reveal>

        <div className="mt-14 md:mt-20">{children}</div>
      </div>
    </section>
  );
}
