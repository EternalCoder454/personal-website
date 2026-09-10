/**
 * Build every screenshot the site serves, from the raw captures.
 *
 * The captures are 4K full-screen grabs with browser chrome around them
 * and, in three cases, real email addresses on screen. This does the
 * whole job in one pass so there is no half-processed intermediate to
 * mistake for a finished file: paint out the addresses, crop to the
 * region worth showing, then write the lightbox twin, the card and the
 * responsive set.
 *
 * Sources live outside public/ on purpose. Anything under public/ is
 * served, and a 4K grab of a real workspace is not something to publish
 * by accident.
 *
 * Run with: npm run screens
 */
import sharp from "sharp";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";

const SRC = process.env.SCREENS_SRC || "screens-src";
const OUT = "public/screens";

/* The lightbox shows every pixel, so its twin stays large. The card is
   never drawn wider than about 440 css pixels, so 1500 is already
   generous and 400/800/1200 cover 1x to 3x. */
const FULL_MAX = 2600;
const CARD_MAX = 1500;
const WIDTHS = [400, 800, 1200];

const S = "Screenshot 2026-09-09 ";

/**
 * Address text to paint out, in source pixel coordinates.
 *
 * Generous on purpose: a truncated address is still an address. Applied
 * to the source before cropping, so these numbers stay readable against
 * the original capture rather than against some derived frame.
 */
const REDACT = {
  [S + "205546.png"]: [
    { left: 480, top: 340, width: 350, height: 40 },
    { left: 965, top: 336, width: 290, height: 40 },
    { left: 480, top: 440, width: 350, height: 40 },
    { left: 480, top: 540, width: 350, height: 40 },
    { left: 3270, top: 1608, width: 300, height: 44 },
  ],
  [S + "205607.png"]: [
    { left: 405, top: 300, width: 520, height: 46 },
    { left: 965, top: 300, width: 760, height: 46 },
    { left: 995, top: 392, width: 680, height: 34 },
    { left: 995, top: 554, width: 680, height: 34 },
    { left: 995, top: 715, width: 680, height: 34 },
    { left: 995, top: 878, width: 680, height: 34 },
  ],
  [S + "205855.png"]: [
    { left: 1145, top: 272, width: 350, height: 36 },
  ],
};

/**
 * What the site shows, and which slice of which capture it comes from.
 *
 * The three proof cards share a 1.60 aspect so the row sits level. The
 * hero stack deliberately does not: those three overlap at angles and
 * want different shapes.
 */
const SHOTS = [
  { name: "heads",     file: S + "205743.png", box: { left: 445, top: 328, width: 1637, height: 1023 } },
  { name: "profile",   file: S + "205812.png", box: { left: 481, top: 328, width: 1638, height: 1024 } },
  { name: "costs",     file: S + "205149.png", box: { left: 425, top: 1418, width: 1120, height: 700 } },
  { name: "dashboard", file: S + "205149.png", box: { left: 62, top: 96, width: 3776, height: 2062 } },
  { name: "tasks",     file: S + "205218.png", box: { left: 425, top: 380, width: 1519, height: 422 } },
  { name: "wiki",      file: S + "205618.png", box: { left: 1755, top: 302, width: 1126, height: 946 } },
];

const black = (r) => ({
  input: { create: { width: r.width, height: r.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } },
  left: r.left,
  top: r.top,
});

/** The source with any addresses already painted out. */
async function clean(file) {
  const img = sharp(join(SRC, file));
  const rects = REDACT[file];
  if (!rects) return img;
  return sharp(await img.composite(rects.map(black)).png().toBuffer());
}

const kb = (n) => (n / 1024).toFixed(0).padStart(4) + " KB";
const size = async (p) => (await stat(p)).size;

async function main() {
  await mkdir(OUT, { recursive: true });

  /* Old screenshots are gone from the site, so their files go too.
     Leaving them costs a megabyte and invites a stale reference. */
  const existing = await readdir(OUT).catch(() => []);
  const keep = new Set(SHOTS.map((s) => s.name));
  let removed = 0;
  for (const f of existing) {
    const base = f.replace(/(-full|-\d+w)?\.webp$/, "");
    if (!keep.has(base)) { await rm(join(OUT, f)); removed++; }
  }
  if (removed) console.log(`removed ${removed} files from a previous set\n`);

  const dims = [];
  for (const shot of SHOTS) {
    const src = await clean(shot.file);
    const cropped = await src.extract(shot.box).png().toBuffer();
    const { width: nw, height: nh } = await sharp(cropped).metadata();

    const fullW = Math.min(nw, FULL_MAX);
    const cardW = Math.min(nw, CARD_MAX);
    const out = [];

    const write = async (name, w) => {
      const p = join(OUT, name);
      await sharp(cropped).resize({ width: w }).webp({ quality: 82, effort: 6 }).toFile(p);
      const m = await sharp(p).metadata();
      out.push(`${String(w).padStart(4)}w ${kb(await size(p))}`);
      return m;
    };

    const full = await write(`${shot.name}-full.webp`, fullW);
    const card = await write(`${shot.name}.webp`, cardW);
    for (const w of WIDTHS) if (w < cardW) await write(`${shot.name}-${w}w.webp`, w);

    dims.push({ name: shot.name, w: card.width, h: card.height, fw: full.width, fh: full.height });
    console.log(`${shot.name.padEnd(10)} crop ${nw}x${nh}  aspect ${(nw / nh).toFixed(2)}`);
    console.log(`           ${out.join("  ")}`);
  }

  console.log("\npaste into lib/site.ts:");
  for (const d of dims) {
    console.log(`  ${d.name.padEnd(10)} width: ${d.w}, height: ${d.h}, fullWidth: ${d.fw}, fullHeight: ${d.fh}`);
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
