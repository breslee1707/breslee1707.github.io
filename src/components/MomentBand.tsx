import { moment } from "../data/content";
import { Reveal } from "./Reveal";

/** Full-bleed parallax image divider with an overlaid caption. */
export function MomentBand() {
  return (
    <section aria-label={moment.caption} className="relative border-t border-line">
      <div
        className="image-band relative min-h-[58vh] w-full"
        style={{ backgroundImage: `url(${moment.image})` }}
        role="img"
        aria-label={moment.imageAlt}
      >
        {/* Legibility gradient — strongest where the text sits. */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-bg/10" />

        <div className="relative mx-auto flex min-h-[58vh] w-full max-w-[72rem] flex-col justify-end px-6 py-16 md:px-10 md:py-20">
          <Reveal>
            <p className="label text-accent">{moment.caption}</p>
            <p className="mt-4 max-w-[18ch] font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
              {moment.line}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
