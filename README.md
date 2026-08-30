# EternalHell

Personal site. Next.js (App Router) + TypeScript, built to the Material 3 spec.
Deployed on Vercel.

```
app/layout.tsx          shell, fonts, metadata, analytics
app/page.tsx            home - profile, socials, clock, experiences
app/gallery/page.tsx    gallery - Pixel Art and Builds
app/globals.css         M3 tokens + every component style
components/             TopAppBar, Clock, Socials, Skills, Gallery, Ripple
lib/site.ts             all the content - edit this, not the components
public/pfp.png          avatar
public/gallery/         gallery images
```

## Run it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. `npm run build` produces the production build;
both pages are fully static.

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

**The clock only renders after mount.** A live time rendered on the server would
not match what the client renders a moment later.

## Deploy

Push to `main` and Vercel builds it. Analytics and Speed Insights are wired up in
`app/layout.tsx` and start reporting once the project is deployed - they collect
nothing in local development.
