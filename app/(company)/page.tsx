import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion";
import { heroShots, og, site, srcSetFor, screenUrl } from "@/lib/site";

/* Title and description are the company defaults from the root layout. */
export const metadata: Metadata = { openGraph: og("/") };

/* The only light page on the site, so the browser chrome follows it. */
export const viewport: Viewport = {
  themeColor: "#d0d6d5",
  colorScheme: "light",
};

/* The real Muster dashboard, the same file the Muster page leads with. */
const shot = heroShots[0];

/**
 * The company home.
 *
 * The product is shown as the product rather than as an icon on a card, and
 * the words are short and plain: one fact to a sentence, a reason joined with
 * "so" where it helps, and nothing added for effect. Written in Zachary's own
 * voice, which states the point and stops. Every fact here is one the Muster
 * page already states.
 */
export default function CompanyHome() {
  return (
    <main id="main" tabIndex={-1}>
      {/* One entrance, on load. Nothing else on the page moves. */}
      <Stagger trigger="mount" step={0.07} className="co-shell pt-20 pb-20 sm:pt-28 sm:pb-24">
        <StaggerItem>
          <h1 className="max-w-[17ch] text-[clamp(40px,6.4vw,76px)] leading-[1.02] font-semibold tracking-[-0.03em] text-balance">
            {site.name} makes software for small businesses.
          </h1>
        </StaggerItem>
        <StaggerItem>
          <p className="mt-6 max-w-[38ch] text-[clamp(19px,2vw,23px)] leading-snug text-pretty text-[var(--co-muted)]">
            Independent and California-owned.
          </p>
        </StaggerItem>
      </Stagger>

      <section aria-labelledby="muster" className="co-shell">
        {/* The product as an object: its own dark ground, because Muster is
            dark, and its real screen running off the edge. The one rounded
            thing on the page. */}
        <div className="grid overflow-hidden rounded-[28px] bg-[#101617] text-[#eef2f2] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col p-7 sm:p-10 md:py-12">
            <h2 id="muster" className="text-[40px] leading-none font-semibold tracking-[-0.03em] sm:text-[48px]">
              {site.product}
            </h2>
            <p className="mt-5 max-w-[34ch] text-[18px] leading-relaxed text-[#b9c4c5]">
              AI department heads for your business: Finance, Legal, Marketing, Operations and
              four more.
            </p>
            <p className="mt-4 text-[15px] text-[#8e9b9c]">In private beta.</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-auto md:pt-10">
              <Link href="/muster" className="co-button">
                Visit {site.product}
              </Link>
              <a
                href={site.appUrl}
                className="text-[16px] underline decoration-[#4a5759] decoration-[1.5px] underline-offset-4 hover:decoration-[#eef2f2]"
              >
                Sign in
              </a>
            </div>
          </div>

          <div className="pl-7 sm:pl-10 md:pt-12 md:pl-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- the
                site serves its own responsive variants, as the Muster page does */}
            <img
              src={screenUrl(shot.src)}
              srcSet={srcSetFor(shot)}
              sizes="(min-width: 768px) 680px, 1px"
              width={shot.width}
              height={shot.height}
              alt={shot.alt}
              className="block h-auto w-full rounded-tl-[14px]"
            />
          </div>
        </div>
      </section>

      <section
        id="about"
        aria-labelledby="about-heading"
        className="co-shell mt-24 scroll-mt-8 sm:mt-32"
      >
        <div className="grid gap-6 border-t border-[var(--co-line)] pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12">
          <h2 id="about-heading" className="text-[26px] font-semibold tracking-[-0.02em]">
            About
          </h2>
          <div className="flex max-w-[62ch] flex-col gap-5 text-[18px] leading-relaxed text-[var(--co-muted)]">
            <p>I’m Zachary, and I run {site.name} out of California.</p>
            <p>
              I work at an accounting practice, so I see the same problems come up in small
              businesses again and again. {site.product} is built around those problems.
            </p>
            <p>My day job covers my bills, so {site.name} can grow at its own pace.</p>
            <p>
              {site.product}’s source code is public, and every update is listed in its changelog.
            </p>
            <p>
              For questions or feedback, email{" "}
              <a href={`mailto:${site.contactEmail}`} className="co-link">
                {site.contactEmail}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
