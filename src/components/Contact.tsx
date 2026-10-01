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
              className="contact-row group"
            >
              <span className="label tabular-nums" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="contact-name">{link.label}</span>
              <span className="label hidden sm:inline">{link.handle}</span>
              <ArrowUpRight
                size={26}
                strokeWidth={1.5}
                className="contact-arrow ml-auto shrink-0"
                aria-hidden
              />
            </a>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
