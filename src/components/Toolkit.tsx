import type { CSSProperties, PointerEvent } from "react";
import { toolkit } from "../data/content";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { Section } from "./Section";
import { TechBadge } from "./TechBadge";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The stack as a silicon die: package, die and four functional blocks drawn
 * as an exploded isometric view that assembles flat as it scrolls into the
 * reading position. All real DOM text — nothing here is a picture.
 */
export function Toolkit() {
  const { ref } = useScrollProgress<HTMLDivElement>({ mode: "pass" });

  // A few degrees of tilt toward the pointer once assembled.
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--tx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    e.currentTarget.style.setProperty("--ty", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const onLeave = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--tx", "0");
    e.currentTarget.style.setProperty("--ty", "0");
  };

  return (
    <Section
      id="toolkit"
      index="06"
      label="Toolkit"
      title="The stack behind the work."
      intro="Practical depth across the AI lifecycle — from model behavior to edge deployment, laid out like the floorplan of a chip."
    >
      <div ref={ref} className="die-scene" onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className="die">
          <div className="die-package" aria-hidden>
            <span className="die-pads die-pads-x" />
            <span className="die-pads die-pads-y" />
            <span className="die-mark label">GH-26 · Rev A · Ho Chi Minh City</span>
          </div>
          <div className="die-core" aria-hidden />
          <ul className="die-blocks">
            {toolkit.map((g, i) => (
              <li
                key={g.group}
                className="die-block"
                style={{ ["--i" as string]: i } as CSSProperties}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="flex items-baseline gap-3 text-lg tracking-[-0.01em]">
                    <span className="label tabular-nums text-accent">{pad(i + 1)}</span>
                    {g.group}
                  </h3>
                  <span className="label tabular-nums" aria-hidden>
                    {pad(g.items.length)} cells
                  </span>
                </div>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <TechBadge key={item} label={item} className="die-cell px-2.5 py-1 text-[0.78rem]" />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
