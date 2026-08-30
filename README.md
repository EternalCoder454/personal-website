# EternalHell

A single-page personal site, built to the Material 3 spec. No build step, no
dependencies — plain HTML/CSS/JS.

```
index.html                  home - profile, socials, clock, experiences
gallery.html                gallery - Pixel Art and Builds, with a lightbox
styles.css                  M3 tokens + components, shared
script.js                   shared; each section no-ops if its page lacks the elements
serve.py                    local preview server (see below)
assets/pfp.png              avatar
assets/gallery/pixel-art/   pixel art images
assets/gallery/builds/      build screenshots
```

## Run locally

```bash
python serve.py
```

Then open <http://localhost:5599>. Opening `index.html` directly works too, but the
copy button falls back to a legacy path because `file://` isn't a secure context.

Use `serve.py` rather than `python -m http.server`. The stdlib server sends no cache
headers, so browsers apply heuristic caching and will serve a stale `script.js` or
`styles.css` after you edit - sometimes without even revalidating, so your changes
appear not to have taken. `serve.py` is the same server with `no-store` added.

It is threaded, which matters: a plain `HTTPServer` handles one connection at a
time, and browsers open several in parallel, so page loads stall behind the queue.

## Design notes

Colors are the **Material 3 baseline dark scheme**, whose seed color (`#6750A4`) is
already purple — so the M3 defaults land on purple/black/white with no deviation
from spec. Everything is a token in `:root`: color roles, the shape scale, elevation,
motion easings, and state-layer opacities.

Components follow M3 patterns rather than approximating them: a small top app bar
whose title fades in only after the hero name scrolls away, assist chips, a filled
card, two-line list items with state layers and pointer-origin ripples, and a
snackbar on `inverse-surface`.

Applied from the UX references:

- **Trailing icons are labeled** ("Open", "Copy") rather than bare glyphs — NN/g
  lists unlabeled icons as a top application-design mistake; the label also enlarges
  the target.
- **Rows are 72px and full-width** (Fitts's Law), well past the 48px touch minimum.
- **Copy gives immediate feedback** — snackbar plus an inline checkmark, under the
  400ms Doherty threshold — and on failure it names the handle instead of saying
  something went wrong.
- **Cards group related content** (Law of Common Region), and the link list is short
  enough to avoid choice overload.
- Decoration that carried no information was removed.
- **Levels run 1-10** in five bands: 1-2 Beginner, 3-4 Intermediate, 5-6 Advanced,
  7-8 Expert, 9-10 Master.
- **The gallery has a real empty state** rather than a blank card, and the lightbox
  closes on Escape, on the scrim, and on an always-visible button - three marked
  exits, per Nielsen's "user control and freedom".
- **The meter is ten dashes, one per level**, so the value can be counted rather than
  estimated off a continuous bar.

Layout follows the M3 window size classes: one column below 905px, two above it
(hero and Socials on the left, Local time and Experiences on the right). The columns
are independent stacks - grid does not align rows across them, so the split is chosen
to keep the two sides close in height.

## Things you might want to change

| What | Where |
| --- | --- |
| Timezone / chip label | `TIMEZONE` and `TZ_LABEL` at the top of `script.js` |
| Line under your name | `.hero__supporting` in `index.html` |
| Add an experience | copy a `<li class="skill">` in `index.html`, set `--level` (1-10), and update `skill__meta` to match |
| Two-column breakpoint | the `@media (min-width: 905px)` block in `styles.css` |
| Colors | the `--md-*` color roles in `:root` in `styles.css` |
| Avatar framing | `.hero__avatar img { transform: scale(...) }` in `styles.css` |
| Avatar image | replace `assets/pfp.png` |

The clock renders in `America/Los_Angeles` no matter where the visitor is, and
handles DST on its own — the chip reads `PST` or `PDT` automatically.

## Adding to the gallery

The gallery has two sections, Pixel Art and Builds. Drop the image in
`assets/gallery/pixel-art/` or `assets/gallery/builds/`, then copy the commented
`<figure class="piece">` template inside that section of `gallery.html` and point it
at the file.

Each section tracks its own state, so one can be full while the other still shows
"Nothing here yet". Both sections share a single lightbox - no other edit needed.

## Deploy

Any static host works — drag the folder into Netlify, or push to a repo and turn on
GitHub Pages. Nothing to compile.
