import { moment } from "../data/content";
import { segment, useScrollProgress } from "../hooks/useScrollProgress";

/**
 * Full-bleed photographic divider that opens like a shutter: the frame starts
 * as a thin horizontal slit and widens to the whole picture as you scroll,
 * then the caption settles in. Static (fully open) without JS or motion.
 */
export function MomentBand() {
  const { ref, reduced } = useScrollProgress<HTMLDivElement>({
    onProgress: (p, el) => {
      el.style.setProperty("--open", segment(p, 0, 0.62).toFixed(4));
      el.style.setProperty("--cap", segment(p, 0.5, 0.78).toFixed(4));
    },
  });

  return (
    <section aria-label={moment.caption} className="relative border-t border-line">
      <div ref={ref} className="aperture" data-static={reduced ? "" : undefined}>
        <div className="aperture-pin">
          <figure className="aperture-frame">
            <img
              src={moment.image}
              alt={moment.imageAlt}
              width={1600}
              height={1066}
              loading="lazy"
              decoding="async"
            />
            <div className="aperture-veil" aria-hidden />
          </figure>
          <span className="aperture-edge aperture-edge-top" aria-hidden />
          <span className="aperture-edge aperture-edge-bottom" aria-hidden />

          <div className="aperture-caption mx-auto w-full max-w-[72rem] px-6 md:px-10">
            <p className="label text-accent">{moment.caption}</p>
            <p className="mt-4 max-w-[16ch] font-display text-[clamp(2.1rem,5.4vw,4rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-white">
              {moment.line}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
