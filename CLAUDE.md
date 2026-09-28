# Eterneon Site

The marketing site for Muster, by Eterneon. Next.js 16, no `src` directory.
Serves eterneon.net. The product is Muster; Eterneon is the company.

## Commands

```
npm run dev          # port 3050
npm run typecheck    # tsc --noEmit
npm run lint
npm run build
npm run screens      # responsive screenshots
```

## Architecture

```
app/(company)/  the Eterneon home at /: light, Schibsted Grotesk, its own header
app/(muster)/   /muster, /privacy, /terms: the Muster header, dark, square
app/            root layout, API routes, sitemap, 404
components/  every client component, flat
lib/         data and helpers
proxy.ts     at the root. NOT middleware.ts
public/      images, with 400w 800w 1200w and full variants
brand/       logos
```

## Hard rules

- `/` is the company and lists the products. Each product gets its own path,
  like `/muster`, in `app/(muster)`. The two looks stay apart: the company
  theme is scoped to `.co` in `globals.css`, and nothing under it may use the
  Muster tokens or the Newsreader serif.
- The company page is written against the patterns that make a page look
  generated: no violet or gradients, no badge above the headline, no row of
  identical cards, no shadow under every box, nothing fading in on scroll,
  and the real product shown rather than an icon for it. Keep it that way.

- IMPORTANT: reduced motion makes an animation instant. It does not skip it.
  The server renders the hidden state because that is what `initial` means, so
  a component that decides not to animate leaves the text at opacity zero
  forever. This once rendered the whole hero invisible. Always animate to the
  shown state and set the duration to zero instead.
- Use `m.*`, never `motion.*`. `LazyMotion` runs with `strict` in
  `components/motion-provider.tsx` and will throw, which is the point.
- Do not swap this site to `motion/mini`. That is the panel's rule. The weight
  here buys `useScroll`, `useSpring` and `useInView`, which mini does not have.
- Images keep their `srcset` and the `sizes` list ending in `1px`, so phones
  take the smallest file. The `-full` variants are around 940KB and are only
  fetched by the lightbox.
- Headings and labels are short and plain, not sentences.

## Workflow

- Load time is the point of this site. Measure the bundle, do not guess. As of
  September 2026: HTML 17.5KB gzipped, CSS 6.9KB, JS 240KB of which react-dom
  is 73KB and Motion 65KB.
- Make minimal changes. Push as soon as typecheck and lint pass, then deploy:
  `ssh eterneon-vps 'cd /srv/site && ./deploy.sh'`. There is no CI, so a push
  on its own changes nothing anybody can see.

## Out of scope

- `public/` image variants. They are generated. Do not hand edit one.
- `brand/`.

## Human approval required

- Adding any dependency. Weigh it against the numbers above first.
- Changing pricing, claims, or anything a customer could hold the company to.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
