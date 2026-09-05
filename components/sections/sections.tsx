import type { ReactNode } from "react";
import { Cta } from "@/components/cta";
import { HeroStack } from "@/components/hero-stack";
import { Zoomable } from "@/components/lightbox";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { FaqList } from "@/components/faq-list";
import { hasProof, proof, screenshots, site } from "@/lib/site";
import { TourFrame } from "@/components/tour";
import {
  beta,
  builder,
  capabilities,
  costs,
  faqs,
  heads,
  problem,
  steps,
  straight,
  trust,
} from "@/lib/content";

/**
 * One section rhythm for the whole page.
 *
 * Space is the hierarchy here. Sections are far apart, headings are
 * large, and there are few enough elements in each that nothing needs a
 * box drawn round it.
 */
function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-24 md:py-36 lg:py-44 ${className}`}>
      <div className="shell">{children}</div>
    </section>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <Reveal>
      <h2 className="t-headline max-w-[20ch] text-balance text-on-surface">{children}</h2>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */

export function Hero() {
  /* The top padding was trimmed when the wordmark moved into the sticky
     bar. The bar carries its own padding, so the old value stacked on
     top of it and pushed the headline 24px further down the phone
     screen. This puts the first line back where it was. */
  return (
    <header className="shell pt-4 pb-20 md:pt-8 md:pb-28">
      <div className="mt-20 grid items-start gap-16 md:mt-28 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-10 xl:gap-14">
        <Stagger trigger="mount" step={0.09} delay={0.45}>
        <StaggerItem>
          <p className="t-label text-primary">Private beta</p>
        </StaggerItem>

        <StaggerItem>
          <h1 className="t-display mt-6 max-w-[16ch] text-balance text-on-surface">
            Every department head your business is missing
          </h1>
        </StaggerItem>

        <StaggerItem>
          <p className="t-body mt-7 max-w-[52ch] text-pretty text-on-surface-variant md:text-[18px]">
            Marketing, Finance, Legal, Operations and four more, in one private workspace. Ask one
            of them, or ask all of them at once and see where they disagree.
          </p>
        </StaggerItem>

        <StaggerItem className="mt-10">
          <Cta />
        </StaggerItem>

        {proof.businessesTesting > 0 ? (
          <p className="t-body-sm mt-8 text-on-surface-variant">
            {proof.businessesTesting} businesses are testing Eterneon right now.
          </p>
        ) : null}

        {/* Three facts, scannable in about a second. The claims a person
            wants settled before they hand over an address. */}
        {/* Axis gaps only. A `gap-4` shorthand alongside a responsive
            `gap-x` resolves by stylesheet order rather than by intent,
            and the items ran together with no space at all. */}
        {/* Short enough to sit on one line each in a third of the column.
            The longer versions wrapped, which turned a scannable row into
            three ragged blocks. */}
        <StaggerItem className="mt-12 grid max-w-[52rem] gap-x-10 gap-y-3 border-t border-outline-variant pt-7 sm:grid-cols-3">
          {[
            "Free for life for testers",
            "No credit card, ever",
            "Your API key stays yours",
          ].map((item) => (
            <p key={item} className="t-body-sm text-on-surface-variant">
              {item}
            </p>
          ))}
        </StaggerItem>
        </Stagger>

        {/* Fills the space the headline leaves on a wide screen, and is
            not rendered at all on a phone. */}
        <div className="lg:pt-4">
          <HeroStack />
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */

export function Problem() {
  return (
    <Section>
      <Heading>{problem.headline}</Heading>
      <p className="t-body mt-8 max-w-[58ch] text-pretty text-on-surface-variant md:text-[18px]">
        {problem.body}
      </p>
      <p className="t-body mt-6 max-w-[58ch] text-pretty text-on-surface md:text-[18px]">
        {problem.kicker}
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Proof() {
  /* An absent section costs less than an empty one. If there is neither
     a film nor a screenshot, this promises nothing and renders nothing. */
  if (!hasProof) return null;

  return (
    <Section>
      <Heading>What it actually looks like</Heading>

      {screenshots.length > 0 ? (
        <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {screenshots.map((shot) => (
            <li key={shot.src}>
              <Zoomable shot={shot}>
                <span className="block overflow-hidden border border-outline-variant bg-surface-lowest transition-colors duration-150 ease-[var(--ease-standard)] group-hover:border-outline">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.src}
                  alt={shot.alt}
                  width={shot.width}
                  height={shot.height}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full"
                />
                </span>
              </Zoomable>
              <p className="t-body-sm mt-4 text-pretty text-on-surface-variant">{shot.caption}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <TourFrame />
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Room() {
  return (
    <Section>
      <Heading>The eight heads you start with</Heading>

      <Stagger as="dl" className="mt-14 grid gap-x-14 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {heads.map((head) => (
          <StaggerItem key={head.name} className="border-t border-outline-variant pt-5">
            <dt className="t-title text-on-surface">{head.name}</dt>
            <dd className="t-body-sm mt-2 text-pretty text-on-surface-variant">{head.note}</dd>
          </StaggerItem>
        ))}
      </Stagger>

      <p className="t-body-sm mt-14 max-w-[58ch] text-pretty text-on-surface-muted">
        Rename them, rewrite what they know, add your own or delete the ones you don’t need. Each
        one can run on a different model.
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Steps() {
  return (
    <Section>
      <Heading>Setup takes about twenty minutes</Heading>

      <Stagger as="ol" className="mt-14 grid gap-x-14 gap-y-12 sm:grid-cols-2">
        {steps.map((step) => (
          <StaggerItem as="li" key={step.n}>
            <span className="t-value text-on-surface-muted">{step.n}</span>
            <h3 className="t-title mt-3 text-[19px] text-on-surface">{step.title}</h3>
            <p className="t-body-sm mt-2 max-w-[42ch] text-pretty text-on-surface-variant">
              {step.body}
            </p>
          </StaggerItem>
        ))}
      </Stagger>

      <Stagger as="ul" className="mt-16 grid gap-x-14 gap-y-4 border-t border-outline-variant pt-8 sm:grid-cols-2">
        {capabilities.map((item) => (
          <StaggerItem as="li" key={item} className="t-body-sm text-on-surface-variant">
            {item}
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Offer() {
  return (
    <Section>
      <Reveal className="border-l-2 border-primary py-2 pl-8 md:pl-10">
        <p className="t-label text-primary">The beta offer</p>
        <h2 className="t-headline mt-6 max-w-[18ch] text-balance text-on-surface">
          {beta.headline}
        </h2>
        <p className="t-body mt-7 max-w-[54ch] text-pretty text-on-surface-variant md:text-[18px]">
          {beta.body}
        </p>
        <p className="t-body mt-5 max-w-[54ch] text-pretty text-on-surface md:text-[18px]">
          {beta.anchor}
        </p>
        <p className="t-body-sm mt-7 max-w-[54ch] text-pretty text-on-surface-muted">
          {beta.caveat}
        </p>
      </Reveal>

      <Stagger as="dl" className="mt-20 grid gap-x-14 gap-y-10 sm:grid-cols-3" step={0.1}>
        {costs.map((cost) => (
          <StaggerItem key={cost.label} className="border-t border-outline-variant pt-5">
            <dt className="t-headline text-[clamp(28px,3.4vw,40px)] text-on-surface tabular-nums">
              <CountUp value={cost.amount} prefix="$" decimals={cost.decimals} />
            </dt>
            <dd className="t-body-sm mt-3 text-pretty text-on-surface-variant">{cost.label}</dd>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Third instance of the same call to action. Somebody who has
          just read the price is as close to deciding as they will get,
          and the next one was 4,000px away. */}
      <div className="mt-16">
        <Cta />
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Trust() {
  return (
    <Section>
      <Heading>Security and your data</Heading>

      <Stagger as="dl" className="mt-14 grid gap-x-14 gap-y-10 sm:grid-cols-2">
        {trust.map((item) => (
          <StaggerItem key={item.title} className="border-t border-outline-variant pt-5">
            <dt className="t-title text-on-surface">{item.title}</dt>
            <dd className="t-body-sm mt-2 max-w-[46ch] text-pretty text-on-surface-variant">
              {item.body}
            </dd>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Straight() {
  return (
    <Section>
      <Heading>What to know before you start</Heading>

      <Stagger as="dl" className="mt-14 grid gap-x-14 gap-y-10 sm:grid-cols-2">
        {straight.map((item) => (
          <StaggerItem key={item.title} className="border-t border-outline pt-5">
            <dt className="t-title text-on-surface">{item.title}</dt>
            <dd className="t-body-sm mt-2 max-w-[46ch] text-pretty text-on-surface-variant">
              {item.body}
            </dd>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Faq() {
  return (
    <Section>
      <Heading>Frequently asked questions</Heading>

      <FaqList faqs={faqs} />
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Builder() {
  return (
    <Section>
      <Heading>{builder.headline}</Heading>

      {/* Narrower than the rest of the page. This is the one stretch of
          continuous prose on the site rather than a grid of short
          facts, so it wants a reading measure, not a marketing one. */}
      <div className="mt-10 max-w-[62ch]">
        {builder.body.map((para) => (
          <p key={para} className="t-body mt-6 text-pretty text-on-surface-variant first:mt-0">
            {para}
          </p>
        ))}
        <p className="t-body mt-8 text-pretty text-on-surface md:text-[18px]">
          {builder.close.lead}
          <a
            href={`mailto:${site.contactEmail}`}
            className="underline decoration-outline underline-offset-4 transition-colors duration-100 hover:text-primary hover:decoration-primary"
          >
            {builder.close.link}
          </a>
          {builder.close.rest}
        </p>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Close() {
  return (
    <Section className="border-t border-outline-variant">
      <h2 className="t-display max-w-[14ch] text-balance text-on-surface">
        Ask for a workspace
      </h2>
      <p className="t-body mt-7 max-w-[50ch] text-pretty text-on-surface-variant md:text-[18px]">
        We invite a few businesses at a time. Leave your email and we’ll send an invitation when
        the next set opens.
      </p>
      <div className="mt-10">
        <Cta />
      </div>
    </Section>
  );
}
