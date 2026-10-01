import { ArrowUp } from "lucide-react";
import { contact, hero, nav, profile, site } from "../data/content";

/** Sign-off: the hero nameplate again, links and a way back up. */
export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-[72rem] px-6 pb-10 pt-20 md:px-10 md:pt-28">
        {/* Bookends the hero: the same two-line nameplate. */}
        <p className="footer-name" lang="vi" aria-label={profile.nameVi}>
          <span aria-hidden>
            {hero.titleLead}
            <br />
            {hero.titleRest}
          </span>
        </p>
        <p className="mt-5 label">
          {profile.role} · {profile.org} &nbsp;·&nbsp; Co&#8209;founder, Code4life®
        </p>

        <div className="mt-16 grid gap-10 border-t border-line pt-10 sm:grid-cols-2">
          <div>
            <p className="label text-accent">Elsewhere</p>
            <ul className="mt-4 space-y-2">
              {contact.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-muted transition-colors hover:text-accent"
                  >
                    {l.label} <span className="text-faint">{l.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label text-accent">On this page</p>
            <ul className="mt-4 space-y-2">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="font-mono text-sm text-muted transition-colors hover:text-accent"
                  >
                    <span className="text-faint">{item.index}</span> {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[72rem] items-center justify-between border-t border-line px-6 py-5 md:px-10 label">
        <span>
          © {new Date().getFullYear()} {site.copyright}
        </span>
        <a href="#intro" className="flex items-center gap-2 transition-colors hover:text-accent">
          Back to top
          <ArrowUp size={14} aria-hidden />
        </a>
      </div>
    </footer>
  );
}
