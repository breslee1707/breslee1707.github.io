import { useEffect, useRef } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { profile, site } from "../data/content";

export function Hero() {
  const fxRef = useRef<HTMLDivElement>(null);

  // Mouse-follow spotlight: only updates CSS vars (no layout), rAF-throttled.
  useEffect(() => {
    const fx = fxRef.current;
    const host = fx?.parentElement;
    if (!fx || !host) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        fx.style.setProperty("--mx", `${x}px`);
        fx.style.setProperty("--my", `${y}px`);
      });
    };
    const enter = () => fx.classList.add("is-live");
    const leave = () => fx.classList.remove("is-live");

    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseenter", enter);
    host.addEventListener("mouseleave", leave);
    return () => {
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseenter", enter);
      host.removeEventListener("mouseleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="intro" className="relative scroll-mt-24 overflow-hidden">
      {/* Technical grid + mouse-follow spotlight */}
      <div ref={fxRef} className="hero-fx" aria-hidden>
        <div className="hero-grid" />
        <div className="hero-grid-accent" />
        <div className="hero-spot" />
      </div>

      {/* Ambient accent light */}
      <div
        className="glow"
        style={{ top: "-12%", right: "-6%", width: "58%", height: "62%" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[72rem] px-6 pt-12 pb-24 md:px-10 md:pt-16 md:pb-28">
        {/* Masthead */}
        <div className="lift flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 label">
          <span>{site.volume}</span>
          <span className="text-faint">Portfolio · {profile.location}</span>
        </div>

        <div className="grid gap-12 pt-12 md:grid-cols-12 md:gap-10 md:pt-16">
          {/* Text column */}
          <div className="md:col-span-7">
            <p
              className="lift label text-accent"
              style={{ ["--lift-delay" as string]: "60ms" }}
            >
              {profile.kicker}
            </p>

            <h1
              className="lift mt-6 text-[clamp(2.6rem,7.2vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.035em]"
              style={{ ["--lift-delay" as string]: "120ms" }}
            >
              Building intelligent systems with{" "}
              <span className="text-accent">product-grade precision.</span>
            </h1>

            <p
              className="lift measure mt-8 text-lg text-muted md:text-xl"
              style={{ ["--lift-delay" as string]: "200ms" }}
            >
              {profile.intro}
            </p>

            <div
              className="lift mt-10 flex flex-wrap items-center gap-3"
              style={{ ["--lift-delay" as string]: "280ms" }}
            >
              <a
                href="#work"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                View selected work
                <ArrowDownRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-y-0.5"
                  aria-hidden
                />
              </a>
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-mono text-sm text-muted transition-colors duration-300 hover:border-accent hover:text-ink"
              >
                Start a conversation
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </a>
            </div>

            {/* Focus chips */}
            <ul
              className="lift mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 label"
              style={{ ["--lift-delay" as string]: "360ms" }}
            >
              {profile.focus.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="size-1 rounded-full bg-accent" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Portrait column */}
          <div className="md:col-span-5">
            <figure
              className="lift float relative"
              style={{ ["--lift-delay" as string]: "180ms" }}
            >
              <div className="portrait-scrim relative overflow-hidden rounded-lg border border-line bg-surface shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)]">
                <img
                  src={profile.portrait}
                  alt={profile.portraitAlt}
                  width={720}
                  height={900}
                  loading="eager"
                  fetchPriority="high"
                  className="aspect-[4/5] w-full object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4 label">
                  <span className="text-ink">{profile.name}</span>
                  <span className="text-faint">
                    {profile.role} · {profile.org}
                  </span>
                </figcaption>
              </div>
            </figure>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="label">Scroll</span>
        <span className="cue-line block h-10 w-px" aria-hidden />
      </div>
    </section>
  );
}
