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
      <Stagger trigger="mount" step={0.07} className="co-shell pt-16 pb-14 sm:pt-20 sm:pb-16">
        <StaggerItem>
          <h1 className="text-[clamp(40px,6.4vw,76px)] leading-[1.02] font-semibold tracking-[-0.03em]">
            {site.name}
          </h1>
        </StaggerItem>
        <StaggerItem>
          <p className="mt-5 max-w-[42ch] text-[clamp(19px,2vw,23px)] leading-snug text-pretty text-[var(--co-muted)]">
            Software for small businesses. Independent and California-owned.
          </p>
        </StaggerItem>
      </Stagger>

      <section aria-labelledby="products" className="co-shell">
        <h2
          id="products"
          className="border-t border-[var(--co-line)] pt-8 text-[26px] font-semibold tracking-[-0.02em]"
        >
          Products
        </h2>
        {/* One entry per product: name, what it is, status, its real screen,
            links. A second product is another <li>. */}
        <ul className="mt-6 list-none">
          <li className="grid overflow-hidden rounded-[28px] bg-[#101617] text-[#eef2f2] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="flex flex-col p-7 sm:p-10 md:py-12">
              <h3 className="text-[40px] leading-none font-semibold tracking-[-0.03em] sm:text-[48px]">
                {site.product}
              </h3>
              <p className="mt-5 max-w-[34ch] text-[18px] leading-relaxed text-[#b9c4c5]">
                AI department heads for your business: Finance, Legal, Marketing, Operations and
                four more.
              </p>
              <p className="mt-4 text-[15px] text-[#8e9b9c]">In private beta</p>
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
          </li>
        </ul>
      </section>

      <section
        id="about"
        aria-labelledby="about-heading"
        className="co-shell mt-20 scroll-mt-8 sm:mt-24"
      >
        <div className="grid gap-6 border-t border-[var(--co-line)] pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12">
          <h2 id="about-heading" className="text-[26px] font-semibold tracking-[-0.02em]">
            About
          </h2>
          <div className="flex max-w-[62ch] flex-col gap-3 text-[18px] leading-relaxed text-[var(--co-muted)]">
            <p>
              I’m Zachary. I run {site.name} from California. I work at an accounting practice and
              see the same small-business problems. {site.product} is built around them.
            </p>
            <p>My day job covers my bills, so {site.name} grows at its own pace.</p>
            <p>{site.product}’s source is public and every update is in its changelog.</p>
            <p>
              Questions or feedback:{" "}
              <a href={`mailto:${site.contactEmail}`} className="co-link">
                {site.contactEmail}
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
