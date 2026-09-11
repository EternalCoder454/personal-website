"use client";

import { usePathname } from "next/navigation";

/**
 * The three jumps in the header.
 *
 * On the home page they are bare fragments, "#pricing", so a click is a
 * jump within the page the reader is already on. They were "/#pricing"
 * everywhere, and that is a different address from "/?utm_source=..."
 * or any other tagged arrival, so a click from a campaign link reloaded
 * the whole page and dropped the tag. Measured on the live site before
 * this change. On every other page they stay "/#pricing", which goes
 * home first and then jumps.
 *
 * 38px tall, the same as Sign in at this width. At 44px they made the
 * bar 69px instead of 63px, and the hero is sized as the viewport less
 * 63px. 38px still clears the 24px WCAG 2.2 AA target minimum.
 */
/* In page order, so the links read top to bottom the way the page does. */
const sections = [
  { label: "Security", id: "security" },
  { label: "Pricing", id: "pricing" },
  { label: "FAQ", id: "faq" },
];

export function SectionNav() {
  const home = usePathname() === "/";

  return (
    <nav aria-label="Sections" className="hidden md:block">
      <ul className="flex items-center">
        {sections.map((item) => (
          <li key={item.id}>
            <a
              href={`${home ? "" : "/"}#${item.id}`}
              className="inline-flex min-h-[38px] items-center px-3 t-body-sm whitespace-nowrap text-on-surface-variant transition-colors duration-100 ease-[var(--ease-standard)] hover:text-on-surface"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
