# Eterneon Site

The marketing site. Next.js 16, no `src` directory, routes and components at
the root. Runs on port 3050 in development. Deployed to eterneon.net from the
one VPS.

Push to `origin main` whenever work is finished and `npm run typecheck` and
`npm run lint` pass. Do not wait to be asked.

## Read first

`D:\Websites\Important Documents` holds the reference material:

- `claude\what_i_like.md`: **read this first, in full.** Standing instructions:
  how to talk, how to write, how to build, and what has already been decided.
  It is written to be loaded as a system prompt.
- `material-design-ux-handbook_3.html`: Material 3, tokens, motion, layout,
  accessibility.
- `branding/`: logos and brand assets.
- `engineering-handbook.html`: performance and testing practice.

## House rules

- No em dashes, en dashes or doubled hyphens in any prose.
- Headings and labels are short and plain, not sentences.
- Comments are long prose that explains why, including the bug that made the
  code look like that.

## Performance, which is the point of this site

Load time is treated as a business concern here: "Even 0.1 faster loading can
keep clients." Measure the bundle rather than guessing at it.

Where it stands, measured September 2026: HTML 17.5 KB gzipped, CSS 6.9 KB, JS
240 KB. Of that JS, react-dom is 73 KB and Motion is 65 KB, about 27 per cent.

Motion is already reduced as far as it usefully goes. `components/motion-provider.tsx`
runs `LazyMotion` with `domAnimation` and `strict`, so only the feature set
this site uses is loaded, and `strict` throws if anybody imports `motion.*`
instead of `m.*`, which would quietly pull the full bundle back in.

Do not swap this for `motion/mini`, which is right in the panel and wrong here.
The remaining weight buys `useScroll` and `useSpring` for the progress bar,
`useInView` for the reveals, and `animate`. Mini has none of those, so the swap
means hand written scroll and intersection code across the whole motion
vocabulary to save about 45 KB.

## Traps

- Reduced motion makes an animation instant. It does not skip it. The server
  renders the hidden state into the HTML because that is what `initial` means,
  so a component that decides not to animate after hydration leaves the text at
  opacity zero forever. This happened once and rendered the entire hero
  invisible. Every component animates to the shown state; reduced motion only
  sets the duration to zero.
- `proxy.ts` at the root, not `middleware.ts`. Next 16 renamed the convention.
- Images are served through a real `srcset` at 400w, 800w, 1200w and full, with
  a `sizes` list ending in `1px` so phones take the smallest file. The `-full`
  variants are around 940 KB and are only fetched by the lightbox on demand.
  Keep it that way.
