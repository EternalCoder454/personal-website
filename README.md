# Eterneon landing site

The public site for Eterneon, the AI department panel. The product itself lives
at `business.eterneon.net`; this repository is only the page in front of it.

Next.js 16 (App Router), React 19, Tailwind v4, TypeScript. Same stack as the
panel, so anybody who works on one can work on the other.

## Running it

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3050 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint, flat config |
| `npm run typecheck` | `tsc --noEmit` |

## Environment

Copy `.env.example` to `.env.local` and fill it in.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | For production | The canonical origin. Set it explicitly: the Vercel-provided variable can resolve to a preview domain, which would put the wrong host in every canonical link, sitemap entry and share card. It is also what makes the logo in the notification email resolve, because an email needs an absolute URL. |
| `RESEND_API_KEY` | For production | Emails each beta request to you. Same key and verified domain the panel already uses. |
| `RESEND_FROM` | No | Sender. Must be on a domain verified in Resend. |
| `WAITLIST_TO` | No | Where the notification lands. Defaults to the contact address. |
| `WAITLIST_WEBHOOK_URL` | No | Alternative to Resend: POST the JSON anywhere. Resend wins if both are set. |
| `NEXT_PUBLIC_TOUR_VIDEO_URL` | No | The product tour. Empty until there is a film. |
| `NEXT_PUBLIC_TOUR_POSTER_URL` | No | Still frame shown before play. |
| `NEXT_PUBLIC_TOUR_CAPTIONS_URL` | No | WebVTT captions for the tour. |
| `PERF_TOKEN` | No | Turns on server timing, and is the bearer token that reads it back. |

### The beta request form

`POST /api/waitlist` validates the submission, applies a per-IP speed bump, and
hands it to `lib/deliver.ts`, which tries two things in order:

1. **Resend**, if `RESEND_API_KEY` is set. Emails you the address with the
   sender set to `RESEND_FROM` and **reply-to set to the person who asked**, so
   answering the invitation is one reply rather than a copy and paste. HTML and
   a plain text alternative are both sent.
2. **A webhook**, if `WAITLIST_WEBHOOK_URL` is set. Posts
   `{ email, receivedAt, source }` to anything that accepts a POST.

The email itself is `lib/emails/beta-request.ts`, built to match the invitation
the panel sends. Tables and inline styles throughout, because Outlook renders
with Word's engine and drops flex, grid and stylesheets. The mark is a hosted
PNG rather than an SVG or a data URI, both of which Gmail strips, which is why
it needs `NEXT_PUBLIC_SITE_URL` to be a real https origin. Without one it falls
back to initials rather than shipping a broken image. The teal square behind it
is a cell background, so a client that blocks images still shows a brand block
rather than a hole.

The address is escaped before it reaches the markup. The endpoint's validator
only rules out whitespace and a missing `@`, so it accepts `<`, `>`, `&` and
`"`, and an address like `a<script>...@evil.com` would otherwise land in the
body verbatim.

Resend wins when both are set. With neither, the form logs in development and
returns a **503 in production** telling the visitor to email instead. It fails
closed on purpose: losing a lead quietly is worse than saying so.

Guards on the endpoint: JSON content type only (a cross-site form with
`enctype="text/plain"` would otherwise post a parseable body without a
preflight), a 4KB body cap, a hidden honeypot field, and a rate limit.

Two things to know about the rate limit. It keys on the platform-provided
client IP rather than the leftmost `x-forwarded-for` entry, because that entry
is client-controlled under any proxy that appends. And it is a `Map` in one
server instance, so the real ceiling is five requests per ten minutes times
however many instances are warm, and it resets on deploy. That is enough for a
form like this. Anything stricter needs shared state.

## Brand

The site, the panel and the exported logo kit have to look like one company,
because the handoff between them happens at the moment of highest scrutiny:
somebody hands over an email, gets an invite, and signs in.

`brand/` holds the shared tokens and the reasoning. Read `brand/README.md`
before changing any colour or typeface here, and change it there first.

Brand assets live in `public/` (favicons, at the paths the kit specified) and
`public/brand/` (app icons, the horizontal lockup). The source kit is in
`Important Documents/branding/branding-eterneon`.

## Where things are

```
app/
  layout.tsx           fonts, metadata, JSON-LD
  page.tsx             section order and the FAQ structured data
  globals.css          every design token, the type scale, the shared surfaces
  opengraph-image.tsx  the 1200x630 share card
  robots.ts            search crawlers allowed, training crawlers not
  api/waitlist/        the beta request handler
  api/perf/            private timing snapshot, behind PERF_TOKEN
components/
  cta.tsx              the one call to action, used three times, identical
  sections/sections.tsx  every section of the page, in order
  motion.tsx           Reveal, Stagger, StaggerItem, CountUp
  hero-stack.tsx       the cycling screenshot carousel
  lightbox.tsx         click a screenshot, read it at full size
  faq-list.tsx         the animated accordion
  site-footer.tsx      identity, contact and the two legal links
  tour.tsx             the video overlay, absent until there is a film
lib/
  content.ts           every string on the page
  site.ts              name, title, description, tour and screenshot config
  deliver.ts           where a beta request goes: Resend, or a webhook
  perf.ts              the in-process timing registry
proxy.ts               the only hook that fires on a page view
```

Copy changes go in `lib/content.ts`. There is no CMS and, for one page, no case
for one.

## The design system

`app/globals.css` holds it. Material 3's token model, reduced to what a
marketing page earns: system color roles, a six-style type scale, one shape
scale, one motion set. No component library and no tonal-palette generation,
because five pages of a site do not repay that architecture.

Some decisions worth not undoing by accident:

- **Dark only.** `color-scheme: dark` is declared and every wash is tuned
  against a near-black ground. A second theme is real work, not a media query.
- **The tokens are the brand kit, not a variation on it.** Colour, ground and
  wordmark come from `branding-eterneon`. `brand/tokens.css` is the canonical
  copy, shared with the panel. If the two ever disagree, that file wins.
- **Two typefaces, two font requests.** Geist is the kit face and carries the
  wordmark and every piece of UI. Newsreader carries editorial headlines only,
  which is the one thing the kit does not specify. It never sets UI chrome and
  never sets the wordmark.
- **Contrast has a floor.** Text holds 5.0:1 at worst and borders 3.5:1, both
  measured against the ground each role actually sits on. Re-measure if the
  primary is ever re-seeded.
- **`--ui` scales large displays.** Every size is expressed against it rather
  than bumped rule by rule inside a breakpoint, so a wide monitor stays in
  proportion. `--measure` caps the column separately.
- **Nothing glows.** There is no gradient wash behind the page, the ground is
  a true neutral with no hue cast, corners are 4px, and nothing is a pill.
  Those four are what make a dark page read as a generic AI launch page, and
  they were removed on purpose. Reinstating any of them undoes the look.
- **Rules before boxes.** Groups are separated by a hairline rather than wrapped
  in a card. The only drawn containers left are the tour frame and the states of
  the form, because those genuinely need an edge.

## Motion

`components/motion.tsx` holds the whole vocabulary: `Reveal`, `Stagger`,
`StaggerItem` and `CountUp`. Use those rather than reaching for `motion`
directly, so the page moves in one voice.

The brief was curiosity, not spectacle. In practice: 10px of travel, half a
second, no bounce on entrances, and every reveal fires once and never again.
The bounce is reserved for hover, where a person caused it. The three moments
allowed to be a little pleased with themselves are the mark drawing itself on
load, the hero stack cycling, and the prices counting up.

**The one rule that is not a matter of taste:** reduced motion makes an
animation *instant*, never *skipped*. The server renders the hidden state into
the HTML, because that is what `initial` means. If the client then decides not
to animate, nothing clears those inline styles and the content stays at
opacity 0 permanently. That is not hypothetical, it shipped here for an hour:
`useReducedMotion` resolves differently on the server and the client, the
components swapped to a do-nothing variant after hydration, and the entire hero
rendered invisible. Never branch to a different tree for reduced motion, and
never give it a variant with no properties in it. Set the duration to zero.

## This is a landing page, not a website

It is built to do one thing: turn a visitor into a beta request. The rules below
are the ones that are easy to erode a change at a time, so they are written down.

- **There is no navigation, anywhere.** No header menu, no footer links, no
  in-page anchors. `lib/site.ts` has no `nav` export and should not grow one. A
  link is an exit, and the page has one way forward.
- **One call to action, and it appears twice.** The same component, the same
  words, in the hero and at the end. Never a second, different offer competing
  with it: no "book a demo" beside "request access", no "learn more".
- **One bright fill.** `--color-cta` is the only bone-bright surface on the page,
  at 16.6:1 against the ground. The moment a card or a heading borrows it, the
  button stops being the obvious thing to press.
- **One form field.** Email. Every extra field costs completions, and a business
  name can be asked for in the reply.
- **The fold carries the whole pitch.** Headline, one sentence of value, and the
  form, inside 812px on a 375px screen. Verified at that size. Anything added
  above the form has to earn its place by pushing the form down.
- **Copy is written to be scanned.** Short sentences, second person, benefit
  before feature, contractions where a person would use one. That is a
  deliberate departure from the formal register used in the panel's own UI copy,
  because this is marketing prose and precision is not the only thing that
  matters here. The house rules that still apply are the honest ones: no em
  dashes, say the number, and no claim the product cannot back.

## The tour overlay

`components/tour.tsx`. One `<dialog>` for the whole page, opened from anywhere
through a context, so a second trigger does not mean a second video element.

**There is no film yet, and the page is honest about it.** While
`NEXT_PUBLIC_TOUR_VIDEO_URL` is empty, `TourFrame` renders the 16:9 frame with a
"Being filmed" label and no play control. Set the variable and the frame becomes
a play button by itself, with nothing else to change.

To add the film:

1. Put the file somewhere a `<video>` can reach: `/public`, Vercel Blob, or a
   CDN. Set `NEXT_PUBLIC_TOUR_VIDEO_URL`.
2. Set `NEXT_PUBLIC_TOUR_POSTER_URL` to a still, or the frame falls back to a
   plain play mark.
3. Export captions as WebVTT and set `NEXT_PUBLIC_TOUR_CAPTIONS_URL`. A tour with
   no captions excludes people who need them and anybody watching with the sound
   off.
4. Set `tour.length` in `lib/site.ts` once the cut is final. It is empty on
   purpose, because a wrong runtime is worse than no runtime.

The CSP derives `media-src` and `img-src` from those same variables at build
time, so an off-origin video is allowed without a second place to remember. A
same-origin path needs no entry.

Two platform behaviours are handled by hand rather than trusted. Both were
measured in a real browser during the build:

- **The `close` event is not dispatched.** `dialog.close()` removed the `open`
  attribute and fired nothing, which left React state stale and the page
  scroll-locked for good. State is synced from a `MutationObserver` on the `open`
  attribute instead, which changes on every close path.
- **Escape did not close the modal**, with focus inside the dialog and `:modal`
  matching. There is an explicit `keydown` handler. Closing a modal is not a
  thing to leave to a behaviour that might not be there.

The video element is mounted only while the overlay is open, so closing stops
playback and the next open starts at the beginning.

Playback itself is untested, because there is no file to play yet. Everything
around it is: opening the overlay, all four close paths, the scroll lock and its
release, and the empty state.

## Performance instrumentation

Private, server side, and off by default.

Set `PERF_TOKEN` and the server starts timing its own work. Read it back with
the same token:

```bash
curl -H "authorization: Bearer $PERF_TOKEN" https://eterneon.net/api/perf
```

Spans come back ranked by total time spent, which is the honest way to rank a
hot path: something slow that runs once matters less than something quick that
runs on every request. Add `?reset=1` to clear the buffer after reading it.

Without the token the instrumentation is inert and `/api/perf` answers **404,
not 401**, so probing it cannot tell you whether there is anything there. The
token is compared as a SHA-256 digest through `timingSafeEqual`, so its length
does not leak either.

**What it records:** a span name, a duration, and whether it succeeded. No IP,
no user agent, no referrer, no cookie, no identifier. That is a deliberate
constraint: it keeps the promise `/privacy` makes, and it means these numbers
are not personal data.

**What it cannot tell you.** Three real limits, worth knowing before trusting a
number:

1. Samples live in one instance's memory. Serverless means several instances and
   cold starts, so a snapshot is what *that* instance has seen since *it*
   started, never a site-wide total.
2. On Vercel the proxy is its own function, separate from the route handler
   lambdas, so `page:*` and `waitlist:*` samples generally land in different
   instances. They share memory only under a self-hosted `next start`.
3. Most of this site is static and served from a CDN, so no code of ours runs on
   a page view at all. The only request doing real server work is the form,
   which is why its phases are broken out. `page:*` counts are traffic shape,
   not render cost.

**The cost.** `proxy.ts` is what fires on a page view, and its presence turns a
free CDN hit into a function invocation on every visit. That is a real price on
a page whose whole point is loading fast. Turn the token on to look at
something, then turn it off. If the measurement is never worth it, delete
`proxy.ts`; nothing else depends on it.

For real user-facing numbers, use Vercel's own analytics or a Lighthouse run.
This is a probe, not an APM.

## Security headers

Set in `next.config.ts`: CSP, HSTS with preload, COOP, CORP, Permissions Policy,
nosniff, frame denial, and `no-store` on `/api`.

The honest gap: `script-src` keeps `'unsafe-inline'`. The App Router emits
per-page inline bootstrap scripts whose content changes, so hashes cannot cover
them and the supported answer is a per-request nonce. A nonce forces every route
to render dynamically, which is the wrong trade for a static page carrying no
user data. It is written down rather than left to be found.

## Before it goes live

- [ ] Name the state in the terms if a lawyer wants it narrower. `legal` says
      "the State of California, United States", which is right for a
      California sole trader.
- [ ] Have a lawyer read the free-for-life clause in `/terms`. A perpetual
      commitment is easy to make and expensive to be vague about.
- [ ] Name the provider that holds the invitation list in `/privacy` once it is
      chosen. Vercel and Stripe are already named.
- [ ] **Generate `public/favicon.ico`.** The head references it, as specified,
      but the kit did not include one and it currently 404s. Browsers fall back
      to the SVG so nothing looks broken, but the request is wasted. Export a
      16/32/48 multi-size .ico from `eterneon-mark-simple-light.svg`.
- [ ] Have a solicitor read the free-for-life clause in `/terms`. A perpetual
      commitment is easy to make and expensive to be vague about.
- [ ] Name the actual processors in the privacy notice once they are chosen.
      There is a visible note on the page marking the gap.
- [ ] Point `NEXT_PUBLIC_SITE_URL` at the real domain.
- [ ] Set `RESEND_API_KEY` on Vercel (the panel key works) and send one test
      submission through it. Check it arrives and that reply-to is the requester.
- [ ] Confirm `eternalhell@eterneon.net` receives mail. It is the contact and privacy address on every page.
- [ ] Confirm the fifth-seat rule. `lib/content.ts` states that a beta tester's
      fifth seat and beyond costs $3.99 a month each, which is inferred from
      "up to three extra seats at no cost" rather than stated. If the intent was
      something else, `beta.fifthSeat` and `asTester()` in
      `components/sections/pricing.tsx` are the two places to change.
- [ ] Verify the domain in Google Search Console and Bing Webmaster Tools and
      submit `/sitemap.xml`. That is worth more than any tag on the page.
- [ ] Check the share card at `/opengraph-image`.
- [ ] Match the headline to wherever the traffic comes from. The H1 is "Every
      department head your business is missing." If an ad or email says
      something different, change one of the two so the visitor does not feel
      switched on arrival.
- [ ] **Add three screenshots.** Drop real PNGs into `public/screens` and list
      them in `screenshots` in `lib/site.ts`. The proof section renders itself
      the moment that array is non-empty, and stays absent while it is empty.
      A head answering, a meeting with several answering at once, and the task
      board are the three worth having.
- [ ] Set `proof.businessesTesting` once the number is real. It renders nothing
      at 0, so there is no placeholder to forget.
- [ ] Run the page through PageSpeed Insights on a real phone, not a simulator.
