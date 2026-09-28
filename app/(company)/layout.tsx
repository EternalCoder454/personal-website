import Link from "next/link";
import { LogoIcon } from "@/components/wordmark";
import { site } from "@/lib/site";

/**
 * The company pages: Eterneon itself, and the products it makes.
 *
 * A route group with its own header and footer, because the Muster pages
 * carry the Muster header, its section jumps and its dark theme, none of which
 * belong to the company. The look is set by .co in globals.css.
 */
export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="co flex flex-col">
      <header className="sticky top-0 z-30 pt-3">
        <div className="co-shell">
          {/* A floating bar rather than a full width band: rounded, and
              lifted off the page like the cards below it. */}
          <div className="flex min-h-[60px] items-center justify-between gap-3 rounded-full border border-[var(--co-line)] bg-white/80 pr-2 pl-5 backdrop-blur-md">
            <Link href="/" className="co-link flex items-center gap-2.5 !text-[var(--co-ink)]">
              <LogoIcon size={26} />
              <span className="text-[17px] font-black tracking-[-0.02em] uppercase">
                {site.name}
              </span>
            </Link>

            <nav aria-label="Main" className="flex items-center gap-1">
              <a href="#products" className="co-link hidden px-3 py-2 text-[15px] sm:inline-flex">
                Products
              </a>
              <a href="#about" className="co-link hidden px-3 py-2 text-[15px] sm:inline-flex">
                About
              </a>
              <a href={`mailto:${site.contactEmail}`} className="co-pill co-pill-solid">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="co-shell mt-24 pb-10">
        <div className="flex flex-col gap-4 border-t border-[var(--co-line)] pt-8 text-[14px] text-[var(--co-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {site.name}. Made in California.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/muster" className="co-link">
              {site.product}
            </Link>
            <Link href="/privacy" className="co-link">
              Privacy
            </Link>
            <Link href="/terms" className="co-link">
              Terms
            </Link>
            <a href={`mailto:${site.contactEmail}`} className="co-link">
              {site.contactEmail}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
