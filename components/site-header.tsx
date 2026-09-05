import { AnimatedWordmark } from "@/components/animated-wordmark";
import { site } from "@/lib/site";

/**
 * A slim bar with the mark and one way into the product.
 *
 * The no-navigation rule still holds: there is no menu here, because
 * there are no other marketing pages to send anybody to and a nav bar
 * would imply some. What was missing is different. Somebody who already
 * has a workspace had no way in from this domain at all, and was left
 * guessing at a subdomain.
 *
 * Sticky rather than fixed, deliberately. A sticky element still takes
 * up its space in the flow, so it can never sit on top of the headline
 * at any width. Fixed would have needed a matching top padding on every
 * page, maintained by hand, and one wrong number puts the bar over the
 * first line of the hero on exactly one phone size.
 *
 * The button is outlined, not filled. There is one filled button on this
 * site and it says "Request beta access". A signed-out stranger is the
 * person this page is for, and the header must not compete with the
 * thing we actually want them to do.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/85 backdrop-blur-md">
      <div className="shell flex items-center justify-between gap-4 py-2.5 sm:py-3">
        <AnimatedWordmark />

        {/* 48px on a phone for the tap target, tighter above it where a
            pointer does not need the room and the bar wants to stay
            slim. `whitespace-nowrap` because "Sign in" wrapping to two
            lines at 320px would break the single row. */}
        <a
          href={site.appUrl}
          className="inline-flex min-h-[48px] shrink-0 items-center rounded-[var(--radius-sm)] border border-outline px-5 t-title text-[15px] whitespace-nowrap text-on-surface-variant transition-colors duration-100 ease-[var(--ease-standard)] hover:border-on-surface-muted hover:text-on-surface sm:min-h-[38px] sm:px-4"
        >
          Sign in
        </a>
      </div>
    </header>
  );
}
