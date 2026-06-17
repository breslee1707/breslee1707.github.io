import type { Logo } from "../data/content";
import { getTechIcon } from "../lib/techIcons";

/** Initials fallback for orgs without a logo (e.g. RegenX -> RX). */
function monogram(org: string): string {
  const caps = org.replace(/[^A-Za-z]/g, "").match(/[A-Z]/g);
  if (caps && caps.length >= 2) return caps[0] + caps[caps.length - 1];
  return org.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
}

const TILE =
  "grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-line";

export function CompanyLogo({ org, logo }: { org: string; logo?: Logo }) {
  if (logo?.type === "img") {
    return (
      <div className={`${TILE} bg-white p-1.5`}>
        <img
          src={logo.src}
          alt={`${org} logo`}
          width={44}
          height={44}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  if (logo?.type === "icon") {
    const icon = getTechIcon(logo.slug);
    if (icon) {
      return (
        <div className={`${TILE} bg-white p-2`}>
          <svg
            viewBox="0 0 24 24"
            className="h-full w-full"
            style={{ fill: `#${logo.hex ?? icon.hex}` }}
            role="img"
            aria-label={`${org} logo`}
          >
            <path d={icon.path} />
          </svg>
        </div>
      );
    }
  }

  return (
    <div className={`${TILE} bg-surface`} aria-hidden>
      <span className="font-display text-sm font-bold tracking-tight text-muted">
        {monogram(org)}
      </span>
    </div>
  );
}
