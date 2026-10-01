import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { profile, hero } from "../data/content";
import { segment, useScrollProgress } from "../hooks/useScrollProgress";
import { useCan3D } from "../hooks/useCan3D";
import { Magnetic } from "./Magnetic";
import { Reveal } from "./Reveal";
import { SplitText } from "./SplitText";

// WebGL only ever loads on the client, after hydration (see useCan3D).
const HeroScan = lazy(() => import("../three/HeroScan"));

export function Hero() {
  const can3D = useCan3D();
  const [live, setLive] = useState(false);
  const [paused, setPaused] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // One scroll value, three overlapping phases (see .hero-stage in index.css).
  const { ref, progress, reduced } = useScrollProgress<HTMLDivElement>({
    onProgress: (p, el) => {
      el.style.setProperty("--p-scan", segment(p, 0, 0.26).toFixed(4));
      el.style.setProperty("--p-resolve", segment(p, 0.16, 0.36).toFixed(4));
      el.style.setProperty("--p-expand", segment(p, 0.3, 1).toFixed(4));
    },
  });

  const onReady = useCallback(() => setLive(true), []);

  // The page ships the light 1200px portrait (fast LCP). Once it has loaded,
  // swap in the full-resolution original wherever the opened-up frame would
  // otherwise show it upscaled — dense screens, wide viewports.
  const [photo, setPhoto] = useState<string>(profile.portrait);
  useEffect(() => {
    const frameW = Math.min(window.innerWidth * 0.94, 1680);
    const shown = Math.max(frameW, window.innerHeight * 0.84 * 0.7467);
    if (shown * window.devicePixelRatio <= 1250) return;
    let cancelled = false;
    const swap = () => {
      const img = new Image();
      img.src = profile.portraitFull;
      img
        .decode()
        .then(() => !cancelled && setPhoto(profile.portraitFull))
        .catch(() => {});
    };
    if (document.readyState === "complete") swap();
    else window.addEventListener("load", swap, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", swap);
    };
  }, []);

  return (
    <section id="intro" className="relative">
      {/* Scan stage: a robot arm laser-scans the portrait into a point cloud;
          scrolling resolves it into the photograph, which then opens up. */}
      <div
        ref={ref}
        className="hero-stage"
        data-live={live ? "" : undefined}
        style={reduced ? { height: "100svh" } : undefined}
      >
        <div className="hero-pin">
          <div className="hero-backdrop" aria-hidden />

          <h1 className="hero-title">
            <span className="hero-line hero-line-1" lang="vi">
              {hero.titleLead}
            </span>{" "}
            <span className="hero-line hero-line-2" lang="vi">
              {hero.titleRest}
            </span>{" "}
            <span className="hero-role label">
              <b>{profile.name}</b> — {profile.role} · {profile.org}
            </span>
          </h1>

          <div ref={frameRef} className="hero-frame-wrap">
            <figure className="hero-frame">
              <img
                src={photo}
                alt={profile.portraitAlt}
                width={1200}
                height={1607}
                loading="eager"
                fetchPriority="high"
              />
              <div className="hero-frame-veil" aria-hidden />
              <figcaption className="hero-frame-cap label">
                <span>{profile.name}</span>
                <span className="opacity-75">
                  {profile.role} · {profile.org}
                </span>
              </figcaption>
            </figure>
            <span className="crop-marks" aria-hidden />
          </div>

          {can3D ? (
            <Suspense fallback={null}>
              <HeroScan
                frameRef={frameRef}
                progress={progress}
                paused={paused}
                onReady={onReady}
              />
            </Suspense>
          ) : null}

          {/* The scan moves on its own, so it can always be stopped. */}
          {live ? (
            <button
              type="button"
              className="hero-pause"
              onClick={() => setPaused((v) => !v)}
              aria-label="Pause motion"
              aria-pressed={paused}
              title={paused ? "Resume motion" : "Pause motion"}
            >
              {paused ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />}
            </button>
          ) : null}

          {reduced ? null : (
            <div className="hero-cue label" aria-hidden>
              <span>{hero.scrollHint}</span>
              <span className="cue-line block h-9 w-px" />
            </div>
          )}
        </div>
      </div>

      {/* Editorial intro — reveals once the portrait has filled the frame. */}
      <div className="relative border-t border-line bg-bg">
        <div className="relative mx-auto w-full max-w-[72rem] px-6 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28">
          <Reveal>
            <p className="label text-accent">{profile.kicker}</p>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-7 max-w-[17ch] font-display text-[clamp(2.4rem,6.6vw,5.2rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
              <SplitText text="Building intelligent systems with" />{" "}
              <span className="text-accent">
                <SplitText text="product-grade precision." start={4} />
              </span>
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p className="measure mt-9 text-lg text-muted md:text-xl">
              {profile.intro}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-11 flex flex-wrap items-center gap-4">
              <Magnetic>
                <a href="#agent-lab" className="btn btn-primary group">
                  Run the Agent Lab
                  <ArrowDownRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-y-0.5"
                    aria-hidden
                  />
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#work" className="btn group">
                  View selected work
                  <ArrowUpRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </a>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <ul className="mt-14 flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-6 label">
              {profile.focus.map((f, i) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="tabular-nums text-accent" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
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
