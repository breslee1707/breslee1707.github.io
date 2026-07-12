import { ArrowUpRight } from "lucide-react";
import { contact } from "../data/content";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function Contact() {
  return (
    <Section
      id="contact"
      index="07"
      label="Contact"
      title="Let's build something technically serious."
      intro={contact.lede}
    >
      <ul className="border-t border-line">
        {contact.links.map((link, i) => (
          <Reveal key={link.label} as="li" delay={i * 70}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 border-b border-line py-6 transition-colors duration-300 hover:text-accent"
            >
              <span className="flex items-baseline gap-4">
                <span className="font-display text-2xl tracking-[-0.02em] md:text-3xl">
                  {link.label}
                </span>
                <span className="label transition-colors group-hover:text-accent">
                  {link.handle}
                </span>
              </span>
              <ArrowUpRight
                size={26}
                strokeWidth={1.5}
                className="shrink-0 text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
                aria-hidden
              />
            </a>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
