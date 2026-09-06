/**
 * Generate the responsive widths for the screenshots.
 *
 * The cards ship one file each at 1500px wide. Measured against the
 * live site, a proof card renders at 333 CSS pixels on a 375px phone
 * and about 437 on the widest desktop, so even a 2x display never
 * needs more than roughly 900. Every phone was downloading nearly
 * twice the pixels it could show.
 *
 * The widths below cover 1x and 2x at both ends, with 1200 as the
 * headroom for a 3x phone. The original 1500px file stays as the
 * largest candidate so nothing that already points at it breaks.
 *
 * Run with: node scripts/responsive-screens.mjs
 * Safe to re-run. Existing outputs are overwritten.
 */
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const DIR = "public/screens";
const WIDTHS = [400, 800, 1200];

/* The -full twins are the lightbox's "actual size" and are deliberately
   left alone: that view exists precisely to show every pixel. */
const isSource = (name) => name.endsWith(".webp") && !name.includes("-full") && !/-\d+w\.webp$/.test(name);

const kb = (n) => (n / 1024).toFixed(0).padStart(4) + " KB";

const sources = (await readdir(DIR)).filter(isSource).sort();
if (sources.length === 0) throw new Error(`no source screenshots in ${DIR}`);

for (const name of sources) {
  const from = join(DIR, name);
  const meta = await sharp(from).metadata();
  const before = (await stat(from)).size;
  const base = name.replace(/\.webp$/, "");
  const line = [`${name}  ${meta.width}x${meta.height}  ${kb(before)}`];

  for (const w of WIDTHS) {
    if (w >= meta.width) continue;
    const out = join(DIR, `${base}-${w}w.webp`);
    await sharp(from).resize({ width: w }).webp({ quality: 82, effort: 6 }).toFile(out);
    line.push(`  ${w}w ${kb((await stat(out)).size)}`);
  }
  console.log(line.join("\n"));
}
