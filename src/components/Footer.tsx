import { ArrowUp } from "lucide-react";
import { contact, profile, site } from "../data/content";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-10">
        <div>
          <p className="font-display text-lg font-bold tracking-tight">
            {profile.name}
          </p>
          <p className="mt-1 label">
            {profile.role} · {profile.org} &nbsp;·&nbsp; Co-founder, Code4life®
          </p>
        </div>

        <div className="flex items-center gap-5 label">
          {contact.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[72rem] items-center justify-between border-t border-line px-6 py-5 md:px-10 label">
        <span className="text-faint">
          © {new Date().getFullYear()} {site.copyright} · {site.volume}
        </span>
        <a
          href="#intro"
          className="flex items-center gap-2 transition-colors hover:text-accent"
        >
          Back to top
          <ArrowUp size={14} aria-hidden />
        </a>
      </div>
    </footer>
  );
}
