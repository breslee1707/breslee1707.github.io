import { useState } from "react";
import { Menu, X } from "lucide-react";
import { nav, profile, site } from "../data/content";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { ThemeToggle } from "./ThemeToggle";

const ids = nav.map((n) => n.id);

export function Nav() {
  const active = useScrollSpy(ids);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-[72rem] items-center justify-between gap-4 px-6 md:px-10"
      >
        <a
          href="#intro"
          className="font-display text-[0.95rem] font-bold tracking-tight"
        >
          {profile.name}
          <span className="ml-2 hidden align-middle text-faint md:inline label">
            {site.volume}
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative px-3 py-2 font-mono text-[0.78rem] tracking-wide transition-colors duration-200 ${
                    isActive ? "text-ink" : "text-faint hover:text-muted"
                  }`}
                >
                  <span className="text-accent">{item.index}</span>{" "}
                  {item.label}
                  {isActive ? (
                    <span className="absolute inset-x-3 -bottom-px h-px bg-accent" />
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full border border-line text-muted md:hidden"
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open ? (
        <ul className="border-t border-line bg-bg px-6 pb-4 md:hidden">
          {nav.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border-b border-line/60 py-3 font-mono text-sm last:border-b-0"
              >
                <span className="text-accent">{item.index}</span>
                <span className="text-muted">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
