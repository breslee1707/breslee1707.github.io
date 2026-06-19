import type { CSSProperties } from "react";
import { getTechIcon } from "../lib/techIcons";

type Props = {
  label: string;
  /** Extra classes for sizing/padding so callers control density. */
  className?: string;
};

/**
 * A technology pill with an optional brand glyph.
 * The glyph is monochrome (inherits text color) and reveals its brand
 * color on hover. Labels without a known icon render as text only.
 */
export function TechBadge({ label, className = "" }: Props) {
  const icon = getTechIcon(label);

  return (
    <li
      className={`group/tech inline-flex items-center gap-1.5 rounded-full border border-line font-mono text-faint transition-colors duration-200 hover:border-accent hover:text-ink ${className}`}
      style={
        icon?.hex ? ({ ["--brand" as string]: `#${icon.hex}` } as CSSProperties) : undefined
      }
    >
      {icon?.img ? (
        <img src={icon.img} alt="" className="size-3.5 shrink-0" aria-hidden />
      ) : icon?.Comp ? (
        <icon.Comp
          size={14}
          className="shrink-0 text-faint transition-colors duration-200 group-hover/tech:text-accent"
          aria-hidden
        />
      ) : icon?.path ? (
        <svg
          viewBox={icon.viewBox ?? "0 0 24 24"}
          className="size-3.5 shrink-0 fill-current transition-colors duration-200 group-hover/tech:fill-[var(--brand)]"
          aria-hidden
        >
          <path d={icon.path} />
        </svg>
      ) : null}
      {label}
    </li>
  );
}
