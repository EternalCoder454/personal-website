# Brand handoff: site and panel

The marketing site and the panel were drifting into two companies. This
directory exists to stop that. `tokens.css` is the shared source of truth.

## What the divergence actually was

| | Site (before) | Panel | Now |
| --- | --- | --- | --- |
| Accent | `#7FA894` sage, hue 152 | `#62C6DA` cyan, hue 190 | `#7FA894` |
| Ground | `#0E1112` | `#171A1C` | one ramp, `#0E1112` site / `#131617` panel |
| Type | Plex Sans + Newsreader | Inter | Plex Sans + Newsreader |
| Shape | 4px | Material default 12dp | 4px |

Hue 152 against hue 190 is not a variation, it is a different colour
family. It matters most at the handoff, when somebody who has just read a
calm sage-and-serif page signs in for the first time. That is the moment a
new user decides whether this is one competent thing or several.

## The order to do it in

If nothing else gets done, do the first two. They are most of the effect.

1. **Accent.** Swap `#62C6DA` for `#7FA894` and take the four `primary`
   roles from `tokens.css` with it. One find-and-replace plus four values.
2. **Ground.** Move the panel's `surface` to `#131617` and map its five
   container steps onto the `--ref-n-*` ramp.
3. **Type.** Inter to IBM Plex Sans. Newsreader only for display moments:
   page titles, empty states, a large number. Not for UI chrome.
4. **Shape.** The Material 12dp default to 4px. This is the cheapest
   change with the largest "somebody chose this" effect.

## The ground question, answered

The site is darker than the panel, and that is on purpose rather than an
oversight to reconcile. A page somebody reads for ninety seconds can sit
at `#0E1112`. A tool somebody has open for eight hours reads better one
step up at `#131617`, which is the same ramp with less halation on long
sessions. Both are `--ref-n-*` values, so they are visibly the same family.
What you cannot ship is two different families.

## The logo

If the system is Plex and Newsreader, the wordmark should not be Satoshi
or Geist. That would make a third voice out of a two-voice system, and the
logo is the one place a third voice is least affordable. Draw the wordmark
from Newsreader, or draw it as a mark with no type at all.

## Contrast

Every ratio in `tokens.css` was measured against the ground the role
actually sits on, not estimated. The floors held to:

- Body text 4.5:1. The lowest in the set is `on-surface-variant` at 7.7:1.
- `outline` 3:1, because a field border is what identifies the control.
  It sits at 3.4:1 on the panel ground.
- Every container role pairs only with its own `on-` role. The lowest of
  those is `on-tertiary` at 6.0:1.

If the primary is ever re-seeded, re-measure. A generated scheme is only
correct by construction when the seed was in a sane chroma range, and
sage sits lower in chroma than most seeds people pick.

## Using it

The panel already uses Material 3 token names, so it can import this file
and delete its own `--md-sys-color-*` block. The site does not import it,
because a marketing page should not pull a stylesheet it only needs six
values from. The site's values live in `app/globals.css` and are kept
identical by hand. If they ever disagree, this file wins.
