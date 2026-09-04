import Link from "next/link";
import { legal, site } from "@/lib/site";
import { Wordmark } from "@/components/wordmark";

/**
 * The only links on the page, and they are here because they have to be.
 *
 * The no-navigation rule is about marketing routes that give somebody
 * an exit. A privacy notice, a contact address and the identity of the
 * company asking for your email are not exits, they are the reason a
 * stranger believes you exist. Kept visually quiet so they read as
 * small print rather than as somewhere to go.
 */
const linkStyle =
  "underline decoration-outline underline-offset-4 transition-colors duration-100 hover:text-primary hover:decoration-primary";

/* Standalone links need a real tap target. Measured at 19px tall on a
   phone, which is under the floor. The email address below stays inline
   in its sentence, where the exception for inline links applies. */
const standaloneLink = linkStyle + " inline-flex min-h-[44px] items-center";

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant py-14">
      <div className="shell">
        <div className="grid gap-x-16 gap-y-8 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-[46ch]">
            <Wordmark />
            {/* The kit tagline, set the way the lockup sets it. */}
            <p className="t-label mt-3 text-primary">Systems for small business</p>

            <p className="t-body-sm mt-8 text-on-surface">
              {legal.entity}
              {legal.soleTrader ? ", a sole trader business" : ""}
              {legal.companyNumber ? `. Company number ${legal.companyNumber}` : ""}
            </p>
            {legal.address ? (
              <p className="t-body-sm mt-1 text-on-surface-muted">{legal.address}</p>
            ) : null}
            <p className="t-body-sm mt-4 text-on-surface-muted">
              Questions, or anything at all:{" "}
              <a className={linkStyle} href={`mailto:${site.contactEmail}`}>
                {site.contactEmail}
              </a>
            </p>
          </div>

          <ul className="t-body-sm flex flex-wrap items-start gap-x-8 text-on-surface-variant md:justify-end">
            <li>
              <Link className={standaloneLink} href="/privacy">
                Privacy
              </Link>
            </li>
            <li>
              <Link className={standaloneLink} href="/terms">
                Beta terms
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-outline-variant pt-7 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="t-body-sm text-on-surface-muted">
            &copy; {site.name}. In private beta.
          </p>
          <p className="t-body-sm text-pretty text-on-surface-muted">
            The Legal and Finance heads give advice, not professional counsel.
          </p>
        </div>
      </div>
    </footer>
  );
}
