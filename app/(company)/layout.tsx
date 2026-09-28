import Link from "next/link";
import { Schibsted_Grotesk } from "next/font/google";
import { Wordmark } from "@/components/wordmark";
import { site } from "@/lib/site";

/*
 * The company's own face. The wordmark is the kit's own artwork, and Geist,
 * as the face of a whole page, is one of the defaults a generated site
 * reaches for, and it is Muster's face too. Schibsted Grotesk came out of a
 * newspaper and reads like one: plain, firm, a little warm. Loaded here, so
 * only the company pages request it and /muster keeps its two fonts.
 */
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-co",
});

/**
 * The company pages: Eterneon itself, and the products it makes.
 *
 * A route group with its own header and footer. The header is a line of text
 * rather than a floating bar, and the footer is one line: a company this size
 * has three places to send somebody, and a four column footer would be
 * pretending otherwise.
 */
export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`co ${schibsted.variable} flex flex-col`}>
      <header className="co-shell flex items-center justify-between gap-4 pt-6 pb-2">
        {/* The kit's lockup in its light version, for this light page. */}
        <Link href="/" className="flex items-center">
          <Wordmark tone="light" height={30} />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-6 text-[16px]">
          <Link href="/muster" className="co-link hidden no-underline! sm:inline">
            {site.product}
          </Link>
          <a href="#about" className="co-link hidden no-underline! sm:inline">
            About
          </a>
          <a href={`mailto:${site.contactEmail}`} className="co-link">
            Contact
          </a>
        </nav>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="co-shell mt-28 pb-10">
        <p className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--co-line)] pt-6 text-[15px] text-[var(--co-muted)]">
          <span>
            &copy; {new Date().getFullYear()} {site.name}, California
          </span>
          <Link href="/privacy" className="hover:text-[var(--co-ink)]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[var(--co-ink)]">
            Terms
          </Link>
        </p>
      </footer>
    </div>
  );
}
