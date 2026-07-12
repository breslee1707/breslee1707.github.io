import { Plus } from "lucide-react";
import { faq } from "../data/content";
import { Reveal } from "./Reveal";

/**
 * Compact FAQ before the footer. Native <details>/<summary> so answers are
 * in the document (and the prerendered HTML) without any JS — mirrored by
 * the FAQPage JSON-LD in index.html.
 */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 border-t border-line">
      <div className="mx-auto w-full max-w-[72rem] px-6 py-16 md:px-10 md:py-20">
        <Reveal>
          <div className="flex items-baseline gap-4">
            <span className="label text-accent" aria-hidden>
              ◆
            </span>
            <h2 id="faq-title" className="label">
              Frequently asked
            </h2>
          </div>
        </Reveal>

        <div className="mt-8 border-t border-line">
          {faq.map((item, i) => (
            <Reveal key={item.q} delay={i * 60}>
              <details className="faq-item group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg tracking-[-0.01em] transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Plus
                    size={18}
                    strokeWidth={1.75}
                    aria-hidden
                    className="faq-icon shrink-0 text-faint transition-transform duration-300"
                  />
                </summary>
                <p className="measure pb-6 text-[0.98rem] text-muted">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
