/**
 * Writes a .br and a .gz beside every compressible static file, at the highest
 * levels each format has.
 *
 * Run once in the image build, after next build. Caddy serves /_next/static
 * straight from disk and picks the .br when the browser accepts it, so the
 * compression is paid once per build rather than on every request, and at a
 * level nobody could afford on every request: brotli at 11 is about a seventh
 * smaller than the gzip the app wrote on the fly, measured on the sign-in
 * page's own scripts.
 *
 * A copy that saves less than a twentieth is not written, so Caddy serves the
 * original rather than spend a header on nothing.
 *
 *   node scripts/precompress.mjs .next/static
 */
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const COMPRESSIBLE = /\.(js|css|svg|json|txt|html|map)$/;
const WORTH_IT = 0.95;

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (COMPRESSIBLE.test(entry.name)) yield path;
  }
}

const root = process.argv[2];
if (!root || !(await stat(root).catch(() => null))?.isDirectory()) {
  console.error("Usage: node scripts/precompress.mjs <directory>");
  process.exit(1);
}

let count = 0;
let before = 0;
let after = 0;
for await (const path of files(root)) {
  const raw = await readFile(path);
  const br = brotliCompressSync(raw, {
    params: {
      [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
      [constants.BROTLI_PARAM_SIZE_HINT]: raw.length,
    },
  });
  const gz = gzipSync(raw, { level: 9 });
  if (br.length < raw.length * WORTH_IT) await writeFile(`${path}.br`, br);
  if (gz.length < raw.length * WORTH_IT) await writeFile(`${path}.gz`, gz);
  count += 1;
  before += raw.length;
  after += Math.min(br.length, raw.length);
}

console.log(
  `precompressed ${count} files: ${Math.round(before / 1024)} KB to ${Math.round(after / 1024)} KB as brotli`,
);
