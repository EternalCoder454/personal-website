import { NextResponse, type NextRequest } from "next/server";
import { perfEnabled, record } from "@/lib/perf";

/**
 * The only hook that fires when somebody loads a page.
 *
 * Named proxy.ts because Next 16 deprecated the middleware convention.
 *
 * A proxy always runs on Node, which is what this needs: the Edge
 * runtime lives in a separate isolate from the route handlers, so
 * anything measured there would be invisible to /api/perf.
 *
 * Node still is not a guarantee: on Vercel this is deployed as its own
 * function, so page samples and waitlist samples generally land in
 * different instances. They share one memory only under a self-hosted
 * `next start`. Read page counts as traffic shape, not as a whole.
 *
 * The trade is real and worth stating: with this file present, a page
 * view that would have been a free CDN hit becomes a function
 * invocation. That is why the body does nothing at all unless
 * PERF_TOKEN is set, and why the matcher excludes every static asset.
 * If you decide the measurement is not worth the invocation, delete
 * this file. Nothing else depends on it.
 */
export default function proxy(request: NextRequest) {
  if (!perfEnabled) return NextResponse.next();

  const t0 = performance.now();
  const response = NextResponse.next();

  /* Middleware cannot see how long the page itself took: next() returns
     immediately and the render happens downstream. What this measures is
     the middleware's own overhead, and what it counts is the shape of
     the traffic. Named so nobody reads it as page render time. */
  record(`page:${request.nextUrl.pathname}`, performance.now() - t0, true);

  return response;
}

export const config = {
  /* No runtime key: a proxy always runs on Node, and declaring it is a
     build error. That is the behaviour this file wanted anyway. */
  /* Documents and API routes only. Static assets, images and the icons
     never reach this, so they stay pure CDN hits. */
  matcher: [
    "/((?!_next/static|_next/image|api/perf|screens/|brand/|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|woff2|webmanifest|txt|xml)$).*)",
  ],
};
