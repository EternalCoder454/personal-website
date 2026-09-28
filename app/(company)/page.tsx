import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { og, site } from "@/lib/site";

/* Title and description are the company defaults from the root layout. */
export const metadata: Metadata = { openGraph: og("/") };

/* The only light page on the site, so the browser chrome follows it. */
export const viewport: Viewport = {
  themeColor: "#f4f5f7",
  colorScheme: "light",
};

/**
 * What each principle says. Every one of these is already a claim the Muster
 * page makes and backs, restated for the company, so this page promises
 * nothing that is not already promised somewhere a customer has read it.
 */
const principles = [
  {
    title: "Priced for small business",
    body: "Built for a business with no IT department and no budget for one. Muster is $9.99 a month at launch.",
  },
  {
    title: "Open about how it works",
    body: "The source is published so you can read it, and every release is written down in plain words.",
  },
  {
    title: "Here for the long run",
    body: "A day job pays the bills, so nothing here gets shut down for growing slowly.",
  },
];

export default function CompanyHome() {
  return (
    <main id="main" tabIndex={-1}>
      <section className="co-shell pt-20 pb-16 sm:pt-28">
        <Stagger trigger="mount" step={0.08} delay={0.1}>
          <StaggerItem>
            <span className="co-tag">Independent software, made in California</span>
          </StaggerItem>
          <StaggerItem>
            <h1 className="mt-6 max-w-[14ch] text-[clamp(44px,7vw,80px)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
              Software a small business can run on.
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-6 max-w-[56ch] text-[18px] leading-relaxed text-pretty text-[var(--co-muted)]">
              {site.name} builds tools that a small business can afford, understand and run
              itself.
            </p>
          </StaggerItem>
          <StaggerItem className="mt-9 flex flex-wrap gap-3">
            <a href="#products" className="co-pill co-pill-solid">
              See our products
            </a>
            <a href="#about" className="co-pill co-pill-line">
              About {site.name}
            </a>
          </StaggerItem>
        </Stagger>
      </section>

      <section id="products" className="co-shell scroll-mt-24 py-10">
        <Reveal>
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] sm:text-[32px]">Products</h2>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Reveal className="co-card flex flex-col p-7 sm:p-9">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="grid h-14 w-14 place-items-center rounded-[18px] bg-[var(--co-accent)] text-[26px] font-bold text-white"
              >
                M
              </span>
              <div>
                <p className="text-[24px] font-semibold tracking-[-0.02em]">{site.product}</p>
                <span className="co-tag mt-1">Private beta</span>
              </div>
            </div>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-[var(--co-muted)]">
              AI department heads for your business. Marketing, Finance, Legal, Operations and
              four more, in one workspace, each reading the same profile of your business before
              it answers.
            </p>
            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              <Link href="/muster" className="co-pill co-pill-solid">
                Explore {site.product}
              </Link>
              <a href={site.appUrl} className="co-pill co-pill-line">
                Sign in
              </a>
            </div>
          </Reveal>

          {/* Where the next product goes. It says there will be a place for
              it and nothing about when, because a date here would be a
              promise. */}
          <Reveal
            delay={0.08}
            className="flex min-h-[220px] flex-col justify-center rounded-[var(--co-radius)] border-2 border-dashed border-[var(--co-line)] p-7 sm:p-9"
          >
            <p className="text-[20px] font-semibold tracking-[-0.01em]">The next one</p>
            <p className="mt-2 text-[16px] leading-relaxed text-[var(--co-muted)]">
              When {site.name} makes something else, it will be listed here.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="co-shell py-10">
        <Stagger className="grid gap-5 md:grid-cols-3" as="ul">
          {principles.map((item) => (
            <StaggerItem key={item.title} as="li" className="co-card p-7">
              <p className="text-[18px] font-semibold tracking-[-0.01em]">{item.title}</p>
              <p className="mt-2 text-[16px] leading-relaxed text-[var(--co-muted)]">{item.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section id="about" className="co-shell scroll-mt-24 py-10">
        <Reveal className="co-card grid gap-8 p-7 sm:p-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] sm:text-[32px]">
            About {site.name}
          </h2>
          <div className="flex flex-col gap-4 text-[17px] leading-relaxed text-[var(--co-muted)]">
            <p>
              {site.name} is a one person software company in California, run by Zachary. There
              is no team behind the logo, and that is the honest version.
            </p>
            <p>
              The work comes from a day job around small businesses, seeing which questions they
              were never asked in time. Each product here is an answer to one of them.
            </p>
            <div className="pt-2">
              <a href={`mailto:${site.contactEmail}`} className="co-pill co-pill-solid">
                Email {site.contactEmail}
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
