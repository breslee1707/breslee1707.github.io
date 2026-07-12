import type { CSSProperties } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { profile, hero } from "../data/content";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { Magnetic } from "./Magnetic";
import { NetworkField } from "./NetworkField";
import { Reveal } from "./Reveal";

export function Hero() {
  const { ref, progress, reduced } = useScrollProgress<HTMLDivElement>();
  const stageVars = { ["--p" as string]: progress } as CSSProperties;

  return (
    <section id="intro" className="relative">
      {/* Cinematic stage: the portrait grows from a framed card to full-bleed
          as you scroll, the cover photo fades, and the name slides apart. */}
      <div
        ref={ref}
        className="hero-stage"
        style={reduced ? { height: "100svh" } : undefined}
      >
        <div className="hero-pin" style={stageVars}>
          {/* Cover — graduation atrium, fades as the portrait expands. */}
          <div className="hero-cover" aria-hidden>
            <img src={hero.cover} alt="" className="size-full object-cover" />
            <div className="hero-cover-veil" />
          </div>

          {/* Expanding portrait. */}
          <figure className="hero-frame">
            <img
              src={profile.portrait}
              alt={profile.portraitAlt}
              width={1200}
              height={1607}
              loading="eager"
              fetchPriority="high"
              className="size-full object-cover"
            />
            <div className="hero-frame-veil" aria-hidden />
            <figcaption className="hero-frame-cap label">
              <span className="text-white">{profile.name}</span>
              <span className="text-white/70">
                {profile.role} · {profile.org}
              </span>
            </figcaption>
          </figure>

          {/* Name, split across the frame, with a role line below. */}
          <h1 className="hero-title">
            <span className="hero-title-name">
              <span className="hero-title-lead">{hero.titleLead}</span>{" "}
              <span className="hero-title-rest">{hero.titleRest}</span>
            </span>
            <span className="hero-subtitle">
              {profile.role} <span aria-hidden>|</span> {profile.org}
            </span>
          </h1>

          {/* Scroll cue (hidden when there's no scroll choreography). */}
          {reduced ? null : (
            <div className="hero-cue label" aria-hidden>
              <span>{hero.scrollHint}</span>
              <span className="cue-line block h-9 w-px" />
            </div>
          )}
        </div>
      </div>

      {/* Editorial intro — reveals once the portrait has filled the frame. */}
      <div className="relative bg-bg">
        <NetworkField className="opacity-70" />
        <div className="relative mx-auto w-full max-w-[72rem] px-6 pb-24 pt-16 md:px-10 md:pb-28 md:pt-24">
          <Reveal>
            <p className="label text-accent">{profile.kicker}</p>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-6 max-w-[18ch] font-display text-[clamp(2.2rem,6.4vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.035em]">
              Building intelligent systems with{" "}
              <span className="text-accent">product-grade precision.</span>
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p className="measure mt-8 text-lg text-muted md:text-xl">
              {profile.intro}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href="#agent-lab"
                  className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Run the Agent Lab
                  <ArrowDownRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-y-0.5"
                    aria-hidden
                  />
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href="#work"
                  className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-mono text-sm text-muted transition-colors duration-300 hover:border-accent hover:text-ink"
                >
                  View selected work
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </a>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 label">
              {profile.focus.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="size-1 rounded-full bg-accent" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
