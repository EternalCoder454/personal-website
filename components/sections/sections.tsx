import type { ReactNode } from "react";
import { Cta } from "@/components/cta";
import { HeroStack } from "@/components/hero-stack";
import { Zoomable } from "@/components/lightbox";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { FaqList } from "@/components/faq-list";
import { conversations, hasProof, proof, screenshots, screenUrl, site, srcSetFor } from "@/lib/site";
import { TourFrame } from "@/components/tour";
import {
  agentic,
  kinds,
  answers,
  beta,
  builder,
  fit,
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
 *
 * The gaps are about a quarter shorter than they first were. At 176px
 * a side on desktop the page ran to 10,872px, and several screens held
 * one heading and little else. Same rhythm, shorter gaps.
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
    <section id={id} className={`py-20 md:py-28 lg:py-32 ${className}`}>
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
     screen. This puts the first line back where it was.

     From lg up the hero also fills the first screen, less the 63px bar,
     with its content centred. It used to end at a fixed 919px, so on any
     window taller than that the next section's heading showed up inside
     the first view and read as part of the hero. Shortening the headline
     to two lines made that 180px worse, which is why trimming the next
     heading never fixed it. */
  return (
    <header className="shell pt-4 pb-20 md:pt-8 md:pb-28 lg:flex lg:min-h-[calc(100svh-63px)] lg:flex-col lg:justify-center lg:py-16">
      <div className="mt-20 grid items-start gap-16 md:mt-28 lg:mt-0 lg:w-full lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center lg:gap-10 xl:gap-14">
        <Stagger trigger="mount" step={0.09} delay={0.45}>
        <StaggerItem>
          <p className="t-label text-primary">{site.product} · Private beta</p>
        </StaggerItem>

        <StaggerItem>
          {/* No max-width. The old 16ch computed to 917px against a
              column that is 583px, so it never bound anything: the grid
              did. Measured in the real face at the real size, a line
              holds about sixteen characters, which is why the headline
              is short enough to break on its own phrases. */}
          <h1 className="t-display mt-6 text-balance text-on-surface">
            AI advisors for small business
          </h1>
        </StaggerItem>

        <StaggerItem>
          <p className="t-body mt-7 max-w-[52ch] text-pretty text-on-surface-variant md:text-[18px]">
            Eight department heads in one private workspace, all reading the same profile of your
            business. Ask one or all at once, and turn on agentic mode so they do the work too.
          </p>
        </StaggerItem>

        <StaggerItem className="mt-10">
          {/* A button, not the form. The form lives in the beta offer, next
              to the price and what testers keep, which is what a reader
              needs before handing over an address. This jumps there. A bare
              fragment, so a tagged arrival keeps its query string. */}
          <a
            href="#pricing"
            className="inline-flex min-h-[52px] items-center rounded-[var(--radius-sm)] bg-cta px-7 t-title text-[16px] whitespace-nowrap text-on-cta transition-colors duration-100 ease-[var(--ease-standard)] hover:bg-on-surface"
          >
            Ask for an invite
          </a>
        </StaggerItem>

        {proof.businessesTesting > 0 ? (
          <p className="t-body-sm mt-8 text-on-surface-variant">
            {proof.businessesTesting} businesses are testing Muster right now.
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
      {problem.body.map((para, i) => (
        <p
          key={para}
          className={`t-body max-w-[58ch] text-pretty text-on-surface-variant md:text-[18px] ${i === 0 ? "mt-8" : "mt-6"}`}
        >
          {para}
        </p>
      ))}
      <p className="t-body mt-6 max-w-[58ch] text-pretty text-on-surface md:text-[18px]">
        {problem.kicker}
      </p>
      <p className="t-body-sm mt-6 max-w-[58ch] text-pretty text-on-surface-muted">
        {problem.caveat}
      </p>
      <p className="t-body-sm mt-4 max-w-[58ch] text-pretty text-on-surface-muted">
        {problem.sources.map((part) =>
          typeof part === "string" ? (
            part
          ) : (
            /* A new tab, so checking a source does not lose the page.
               noreferrer, because the source has no need to know the
               reader came from here. */
            <a
              key={part.href}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-outline underline-offset-4 transition-colors duration-100 hover:text-primary hover:decoration-primary"
            >
              {part.text}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ),
        )}
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Answers() {
  return (
    <Section>
      <Heading>{answers.headline}</Heading>
      <p className="t-body mt-8 max-w-[58ch] text-pretty text-on-surface-variant md:text-[18px]">
        {answers.intro}
      </p>

      {/* One row of four. Two by two took 1,370px, most of a screen and a
          half, to make a point the captions already make in text. The
          reply is too small to read in place at this size, and the whole
          reply is one click away. Below lg the row scrolls sideways
          instead of stacking four tall cards down a phone. */}
      <ul className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
        {conversations.map((shot) => (
          <li key={shot.src} className="w-[78vw] max-w-[320px] shrink-0 snap-start lg:w-auto lg:max-w-none">
            <Zoomable shot={shot}>
              <span className="block overflow-hidden border border-outline bg-surface-lowest transition-colors duration-150 ease-[var(--ease-standard)] group-hover:border-on-surface-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenUrl(shot.src)}
                  srcSet={srcSetFor(shot)}
                  /* Measured: 324, 274 and 244px across the fixed
                     shell widths, and a quarter of what the shell
                     leaves from 1024. Below that, the scroller card. */
                  sizes="(min-width: 2200px) 324px, (min-width: 1600px) 274px, (min-width: 1184px) 244px, (min-width: 1024px) calc((100vw - 160px) / 4), min(78vw, 320px)"
                  alt={shot.alt}
                  width={shot.width}
                  height={shot.height}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full"
                />
              </span>
              <span className="t-label mt-4 block text-primary">Full reply</span>
            </Zoomable>
            <p className="t-body-sm mt-2 text-pretty text-on-surface-variant">{shot.caption}</p>
          </li>
        ))}
      </ul>
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
      <Heading>Screenshots</Heading>

      {screenshots.length > 0 ? (
        <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {screenshots.map((shot) => (
            <li key={shot.src}>
              <Zoomable shot={shot}>
                {/* outline, not outline-variant. Measured against the page
                    ground: the old border was 1.29:1, where a UI boundary
                    wants 3:1, and the screenshots themselves sit between
                    1.03 and 1.33 of the same tone. With nothing to mark
                    the edge, a dark screenshot on a dark page is a smudge.
                    outline is 4.06:1 and is already the site's visible
                    boundary token. */}
                <span className="block overflow-hidden border border-outline bg-surface-lowest transition-colors duration-150 ease-[var(--ease-standard)] group-hover:border-on-surface-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenUrl(shot.src)}
                  srcSet={srcSetFor(shot)}
                  /* One column on a phone inside 20px of shell padding,
                     a third of the shell from md, and a fixed third of
                     the wider measure on a large display. */
                  /* Card width solved per breakpoint from --measure
                     and .shell padding. "30vw" was 30% too generous at
                     1440, which made the browser take the 800w file to
                     paint 331 css pixels. */
                  sizes="(min-width: 2200px) 437px, (min-width: 1600px) 371px, (min-width: 1184px) 331px, (min-width: 768px) calc((100vw - 128px) / 3), calc(100vw - 40px)"
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
        Each head reads your profile, decisions and key figures first. Rename, rewrite, add or
        delete heads, or run each on another model.
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Agentic() {
  return (
    <Section id="agentic">
      <Heading>{agentic.headline}</Heading>

      <Stagger as="dl" className="mt-14 grid gap-x-14 gap-y-10 sm:grid-cols-2">
        {agentic.items.map((item) => (
          <StaggerItem key={item.title} className="border-t border-outline-variant pt-5">
            <dt className="t-title text-on-surface">{item.title}</dt>
            <dd className="t-body-sm mt-2 max-w-[46ch] text-pretty text-on-surface-variant">
              {item.body}
            </dd>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-14 border-l-2 border-primary py-1 pl-6">
        <p className="t-body-sm max-w-[58ch] text-pretty text-on-surface-variant">{agentic.note}</p>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Kinds() {
  return (
    <Section id="kinds">
      <Heading>{kinds.headline}</Heading>

      <Stagger as="dl" className="mt-14 grid gap-x-14 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {kinds.groups.map((group) => (
          <StaggerItem key={group.title} className="border-t border-outline-variant pt-5">
            <dt className="t-title text-on-surface">{group.title}</dt>
            <dd className="t-body-sm mt-2 max-w-[40ch] text-pretty text-on-surface-variant">{group.body}</dd>
          </StaggerItem>
        ))}
      </Stagger>

      <Stagger as="ul" className="mt-14 grid gap-x-14 gap-y-8 md:grid-cols-2">
        {kinds.examples.map((example) => (
          <StaggerItem as="li" key={example.who}>
            <p className="t-label text-primary">{example.who} gets</p>
            <p className="t-body-sm mt-2 max-w-[52ch] text-pretty text-on-surface-variant">{example.gets}</p>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-14 border-l-2 border-primary py-1 pl-6">
        <p className="t-body-sm max-w-[58ch] text-pretty text-on-surface-variant">{kinds.note}</p>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Steps() {
  return (
    <Section>
      <Heading>Setup in about twenty minutes</Heading>

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

      <Reveal className="mt-16 border-t border-outline-variant pt-8">
        <p className="t-label text-primary">Also included</p>
      </Reveal>

      <Stagger as="ul" className="mt-6 grid gap-x-14 gap-y-4 sm:grid-cols-2">
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
    <Section id="pricing">
      <Reveal className="border-l-2 border-primary py-2 pl-8 md:pl-10">
        <p className="t-label text-primary">The beta offer</p>
        <h2 className="t-headline mt-6 max-w-[18ch] text-balance text-on-surface">
          {beta.headline}
        </h2>
        <p className="t-body mt-7 max-w-[54ch] text-pretty text-on-surface-variant md:text-[18px]">
          {beta.body}
        </p>
        <p className="t-body-sm mt-7 max-w-[54ch] text-pretty text-on-surface-muted">
          {beta.caveat}
        </p>
      </Reveal>

      <Stagger as="dl" className="mt-20 grid gap-x-14 gap-y-10 sm:grid-cols-3" step={0.1}>
        {costs.map((cost) => (
          <StaggerItem key={cost.label} className="border-t border-outline-variant pt-5">
            <dt className="t-headline text-[clamp(28px,3.4vw,40px)] text-on-surface tabular-nums">
              ${cost.amount.toFixed(cost.decimals)}
            </dt>
            <dd className="t-body-sm mt-3 text-pretty text-on-surface-variant">{cost.label}</dd>
          </StaggerItem>
        ))}
      </Stagger>

      {/* The form sits here, right after the price. Somebody who has just
          read it is as close to deciding as they will get, and the hero's
          button jumps straight to this spot. */}
      <div className="mt-16">
        <Cta />
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Trust() {
  const groups = [
    { title: "Security", items: trust },
    { title: "Limits", items: straight },
  ];

  return (
    <Section id="security">
      <Heading>Security and limits</Heading>

      {groups.map((group) => (
        <div key={group.title} className="mt-14">
          <h3 className="t-title text-on-surface">{group.title}</h3>
          <Stagger as="dl" className="mt-6 grid gap-x-14 gap-y-8 sm:grid-cols-2">
            {group.items.map((item) => (
              <StaggerItem key={item.title} className="border-t border-outline-variant pt-5">
                <dt className="t-title text-on-surface">
                  {/* Inside the dt to stay valid HTML; decorative, so alt is empty. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.icon}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="mb-5 block h-10 w-10"
                  />
                  {item.title}
                </dt>
                <dd className="t-body-sm mt-2 max-w-[46ch] text-pretty text-on-surface-variant">
                  {item.body}
                </dd>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      ))}
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Fit() {
  /* Two facing boards, weighted on purpose. The left one is the pitch
     and steps forward: a cyan edge, the lighter card, text at full
     brightness, and its label on a cyan tag, 5.6:1. The right one turns
     business away and steps back: the plain edge, the base card, muted
     text, a bare label, and a closing note in grey
     rather than white, which had been the brightest thing in the box.
     A grey tag there measured 4.95:1, under the 5.0 floor, and would
     have brightened the board meant to recede. It keeps the tag's
     vertical padding so both lists still start level.
     Same structure on both, so they still read as a pair. */
  const boards = [
    {
      ...fit.forYou,
      note: undefined as string | undefined,
      box: "border-primary/70 bg-surface-container",
      labelColor: "inline-block rounded-[var(--radius-sm)] bg-primary/15 px-3 py-1.5 text-primary",
      dotColor: "bg-primary",
      textColor: "text-on-surface",
    },
    {
      ...fit.notForYou,
      box: "border-outline-variant bg-surface-low",
      labelColor: "py-1.5 text-on-surface-muted",
      dotColor: "bg-on-surface-muted",
      textColor: "text-on-surface-muted",
    },
  ];

  return (
    <Section>
      <Heading>{fit.headline}</Heading>

      <Stagger className="mt-14 grid gap-8 md:grid-cols-2" step={0.1}>
        {boards.map((board) => (
          <StaggerItem key={board.label} className={`border ${board.box} p-8 md:p-10`}>
            <p className={`t-label ${board.labelColor}`}>{board.label}</p>

            <ul className="mt-7 space-y-4">
              {board.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-[0.6em] h-[5px] w-[5px] shrink-0 rounded-full ${board.dotColor}`}
                  />
                  <span className={`t-body-sm text-pretty ${board.textColor}`}>{item}</span>
                </li>
              ))}
            </ul>

            {board.note ? (
              <p className="t-body-sm mt-7 border-t border-outline-variant pt-6 text-pretty text-on-surface-variant">
                {board.note}
              </p>
            ) : null}
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Faq() {
  return (
    <Section id="faq">
      <Heading>Questions</Heading>

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
        We invite a few businesses at a time. Leave your email for the next set.
      </p>
      <div className="mt-10">
        <Cta />
      </div>
    </Section>
  );
}
