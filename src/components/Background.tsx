import type { PointerEvent } from "react";
import { background, awards } from "../data/content";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

/** Plates lean toward the pointer and catch a moving sheen (mouse only). */
function tilt(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--rx", `${((0.5 - y) * 7).toFixed(2)}deg`);
  el.style.setProperty("--ry", `${((x - 0.5) * 9).toFixed(2)}deg`);
  el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
  el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
}
function untilt(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
}

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
      <ul className="grid gap-px overflow-hidden rounded-[6px] border border-line bg-line md:grid-cols-3">
        {background.disciplines.map((d, i) => (
          <li key={d.key}>
            <Reveal delay={i * 90} className="h-full">
              <div className="flex h-full flex-col bg-bg p-7 md:p-9">
                <span className="discipline-num" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-xl tracking-[-0.02em]">{d.key}</h3>
                <p className="mt-3 text-[0.98rem] text-muted">{d.body}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      {/* Recognition, as two catalogue plates. */}
      <div className="mt-24">
        <div className="flex items-center gap-4">
          <span className="label text-accent" aria-hidden>
            ◆
          </span>
          <span className="label">Proof &amp; recognition</span>
          <span className="ruler" aria-hidden />
        </div>
        <div className="mt-12 grid gap-14 md:grid-cols-2 md:gap-10">
          {awards.map((a, i) => (
            <Reveal key={a.title} delay={i * 90} as="article" className="plate">
              <div
                className="plate-stage"
                onPointerMove={tilt}
                onPointerLeave={untilt}
              >
                <div className={`plate-photo plate-fit-${a.fit}`}>
                  <img
                    src={a.image}
                    alt={a.imageAlt}
                    width={a.fit === "photo" ? 960 : 1500}
                    height={a.fit === "photo" ? 1280 : 996}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="plate-sheen" aria-hidden />
                </div>
                <span className="crop-marks" aria-hidden />
              </div>
              <p className="label mt-8">
                <span className="text-accent">Pl. {String.fromCharCode(65 + i)}</span>
                {"  ·  "}
                {a.meta}
              </p>
              <h3 className="mt-4 text-2xl tracking-[-0.025em] md:text-[1.8rem]">{a.title}</h3>
              <p className="mt-4 max-w-[46ch] text-[0.98rem] text-muted">{a.body}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {a.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-[3px] border border-line px-2.5 py-1 font-mono text-xs text-faint"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
