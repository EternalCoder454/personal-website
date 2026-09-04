import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { perfEnabled, reset, snapshot } from "@/lib/perf";

export const runtime = "nodejs";
/* Never prerendered, never cached. A snapshot is only ever about now. */
export const dynamic = "force-dynamic";

/**
 * Private performance snapshot.
 *
 * The folder is deliberately not named _perf: the App Router treats a
 * leading underscore as a private folder and never routes it, so that
 * version silently did not exist. Obscurity was never the protection
 * here anyway, the token is.
 *
 * Not linked from anywhere, disallowed in robots.txt, and it does not
 * exist at all unless PERF_TOKEN is set: without a token the route
 * answers 404 rather than 401, so probing it tells you nothing about
 * whether there is something here to find.
 *
 *   curl -H "authorization: Bearer $PERF_TOKEN" https://eterneon.net/api/perf
 *
 * Add ?reset=1 to clear the buffer for this instance after reading it.
 */

function unauthorized() {
  /* 404, not 403. The endpoint should be indistinguishable from one that
     was never deployed. */
  return new NextResponse("Not found", {
    status: 404,
    headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });
}

/**
 * Compares digests rather than the tokens themselves.
 *
 * Comparing the raw strings needs a length check first, and that check
 * returns early, which leaks the token length through timing. Hashing
 * both sides gives two fixed-length buffers, so there is nothing to
 * return early on.
 */
function tokenMatches(given: string, expected: string): boolean {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const expected = process.env.PERF_TOKEN;
  if (!perfEnabled || !expected) return unauthorized();

  const header = request.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!given || !tokenMatches(given, expected)) return unauthorized();

  const data = snapshot();

  if (new URL(request.url).searchParams.get("reset") === "1") {
    reset();
  }

  return NextResponse.json(data, {
    headers: {
      "cache-control": "no-store, max-age=0",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
