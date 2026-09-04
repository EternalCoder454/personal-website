"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useId, useState } from "react";

/**
 * The FAQ, as a controlled accordion.
 *
 * It used to be <details>, which cannot animate its own height: the
 * panel simply appeared. Expanding is the one interaction on this page a
 * person performs and then waits on, so it is worth the height animation
 * and worth the extra code.
 *
 * What <details> was giving us for free and is reimplemented here:
 * aria-expanded and aria-controls on the trigger, one open at a time,
 * and a real button so the keyboard works. The FAQPage structured data
 * lives in page.tsx and is unaffected by any of this.
 */
export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  const reduced = useReducedMotion();
  const ids = useId();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-14 max-w-[68ch] border-t border-outline-variant">
      {faqs.map((faq, index) => {
        const isOpen = open === index;
        const panelId = `${ids}-panel-${index}`;
        const buttonId = `${ids}-button-${index}`;

        return (
          <div key={faq.q} className="border-b border-outline-variant">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors duration-100 ease-[var(--ease-standard)] hover:text-primary"
              >
                <span className="t-title text-balance text-[18px]">{faq.q}</span>
                <m.svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0 text-on-surface-muted"
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={
                    reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 25 }
                  }
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </m.svg>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <m.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  key="panel"
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? { height: 0 } : { height: 0, opacity: 0 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          height: { duration: 0.32, ease: [0.22, 0.61, 0.36, 1] },
                          opacity: { duration: 0.22 },
                        }
                  }
                  className="overflow-hidden"
                >
                  <p className="t-body-sm pb-7 text-pretty text-on-surface-variant">{faq.a}</p>
                </m.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
