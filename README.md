# EternalHell

Personal site. Next.js (App Router) + TypeScript, built to the Material 3 spec.
Deployed on Vercel.

```
app/layout.tsx          shell, fonts, metadata, analytics
app/not-found.tsx       404
app/error.tsx           per-route error boundary
app/global-error.tsx    boundary for failures in the layout itself
app/sitemap.ts          /sitemap.xml
app/robots.ts           /robots.txt
app/page.tsx            home - profile, socials, clock, experiences
app/gallery/page.tsx    gallery - Pixel Art and Builds
app/globals.css         M3 tokens + every component style
components/             TopAppBar, ThemeToggle, Clock, Socials, Skills, Contact, Gallery
lib/site.ts             all the content - edit this, not the components
public/pfp.png          avatar
public/gallery/         gallery images
```

## Run it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

| script | |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run lint` | eslint |
| `npm run typecheck` | `tsc --noEmit`, after regenerating route types |

`pretypecheck` runs `next typegen` first. Without it, deleting a route leaves stale
generated types in `.next/types` and the typecheck fails on a file you no longer have.

## Editing content

Almost everything lives in `lib/site.ts` - name, tagline, timezone, socials,
experiences, gallery. You should rarely need to open a component.

**Add an experience.** Add a line to `skills`. Levels run 1-10 and the band name
is derived from the number, so there is nothing to keep in sync:

```ts
{ name: "Pixel Artist", level: 1, icon: "grid_on" }
```

| 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |
| --- | --- | --- | --- | --- |
| Beginner | Intermediate | Advanced | Expert | Master |

**Add a gallery piece.** Drop the image in `public/gallery/pixel-art/` or
`public/gallery/builds/`, then add a line to that section's `pieces`:

```ts
{ src: "/gallery/builds/spawn.png", alt: "Spawn area", caption: "Spawn" }
```

Each section tracks its own state, so one can be full while the other still shows
"Nothing here yet". Both share one lightbox.

Icon names come from [Material Symbols](https://fonts.google.com/icons). Check a
name at 20px before committing to it - plenty of them are illegible that small.

## Notes

**Icons use our own `.icon` class, not Google's `.material-symbols-rounded`.**
Google's hosted stylesheet sets `display` and `font-size` on that class, and it
loads after Next's CSS, so it silently overrode the icon containers and knocked
every glyph out of its circle. Their sheet now only supplies the `@font-face`.

**Gallery images use plain `<img>`, not `next/image`.** The optimiser resamples,
which blurs exactly the hard edges that make pixel art pixel art.

**The whole UI scales from one variable.** `--ui` in `:root` multiplies every
font size, line height and icon box, and steps up at 1200/1600/2000/2600px. Sizes
were previously bumped rule by rule at one breakpoint, which is how half of them
ended up out of step with the rest.

**Brand icon viewBoxes are measured, not assumed.** Reddit's antenna pushes its
bounding box up, so its mark renders 0.47 units high in a plain `0 0 24 24` box.
Its viewBox is offset by exactly that. Check `getBBox()` before adding an icon.

**Theme is dark by default, light is opt-in.** An inline script in the layout
applies a stored choice before first paint, so light never flashes dark first.
The toggle writes `data-theme` on `<html>` and localStorage directly instead of
holding React state - state would mean the server rendering one icon and the
client swapping it on hydration. CSS picks the icon from the same attribute.

**Entrance animations are on the cards, never on `.content` or `.column`.** A
transform makes an element the containing block for its fixed-position
descendants, which would tear the snackbar and the lightbox out of the viewport.

**The clock uses `useSyncExternalStore`, not `useEffect` + `setState`.** It reads a
value that changes outside React, which is exactly what that hook is for; the server
snapshot returns null so the first paint is the placeholder and hydration matches.
Ticks are scheduled to the next whole second rather than every 1000ms, which
would drift and eventually skip a second, and one timer is shared so the clock
and the timezone chip never disagree.

**Security headers and `poweredByHeader: false` live in `next.config.ts`.** HSTS is
scoped to Vercel, since it means nothing over plain HTTP locally.

## Deploy

Push to `main` and Vercel builds it. Every page is static; there is no database,
no server state, and nothing to configure beyond the repo itself.

Analytics and Speed Insights are wired up in `app/layout.tsx` and start reporting
once deployed - they collect nothing in local development.

### Editing without a checkout

`lib/site.ts` can be edited straight from github.com, on a phone or a laptop.
Commit and Vercel redeploys in about a minute. Gallery images can be dragged into
`public/gallery/pixel-art/` or `public/gallery/builds/` the same way.
