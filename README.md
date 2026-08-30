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
app/panel/              admin panel (guarded) + login
app/api/auth/[...all]/  Better Auth handler
lib/auth.ts             auth config - password, social, 2FA
lib/db.ts               postgres pool
lib/content.ts          reads content, falls back to site.ts defaults
lib/guard.ts            admin check used by pages AND every server action
scripts/                schema, migrations, admin seed
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

**The clock uses `useSyncExternalStore`, not `useEffect` + `setState`.** It reads a
value that changes outside React, which is exactly what that hook is for; the server
snapshot returns null so the first paint is the placeholder and hydration matches.
Setting state directly in an effect causes cascading renders, and the React lint
rule flags it.

**Security headers and `poweredByHeader: false` live in `next.config.ts`.** HSTS is
scoped to Vercel, since it means nothing over plain HTTP locally.

## Panel

`/panel` edits experiences and gallery pieces. It needs a Postgres database and,
for image uploads, Vercel Blob.

### First-time setup

1. **Database** - Vercel > Storage > Neon Postgres. Copy the connection string.
2. **Blob** - Vercel > Storage > Blob, created with **public** access. Gallery
   images are shown on a public page, so a private store will upload fine and
   then serve 403 to visitors.
3. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL`,
   `BLOB_READ_WRITE_TOKEN`, and a `BETTER_AUTH_SECRET`
   (`openssl rand -base64 32`).
4. Create the tables and the admin account:

```bash
npm run auth:migrate   # Better Auth tables
npm run migrate        # content tables + seeds the current skills
npm run seed:admin     # prints a generated password once
```

`auth:migrate` goes through Better Auth's programmatic `getMigrations` rather
than the standalone `@better-auth/cli`. The CLI is published separately and lags
the library; running the two out of step produces a schema that is quietly
missing columns the library expects.

`seed:admin` prints the password to your terminal and nowhere else. Copy it,
sign in at `/panel/login`, and treat it as temporary.

### The three stages

**Password** is on now. **Social login** turns itself on as soon as
`GITHUB_CLIENT_ID`/`SECRET` or `DISCORD_CLIENT_ID`/`SECRET` are set - the buttons
appear on the login form on their own. **2FA** is set up from the Security card
in the panel. Once social and 2FA both work, set `emailAndPassword.enabled` to
`false` in `lib/auth.ts` and the password path is gone.

### Notes

Content reads fall back to the defaults in `lib/site.ts` when the database is
unreachable, so an outage degrades the site instead of breaking it.

The public pages stay statically prerendered; saving in the panel calls
`revalidatePath`, which regenerates them. Static speed, immediate updates.

`lib/guard.ts` is re-checked inside **every** server action. Server actions are
public HTTP endpoints - a guarded page alone would not protect them.

## Deploy

Push to `main` and Vercel builds it. Analytics and Speed Insights are wired up in
`app/layout.tsx` and start reporting once the project is deployed - they collect
nothing in local development.
