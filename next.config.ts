import type { NextConfig } from "next";

const dev = process.env.NODE_ENV === "development";

/**
 * Start closed, open exactly what the page uses.
 *
 * The honest gap: script-src keeps 'unsafe-inline'. The App Router emits
 * per-page inline bootstrap scripts whose content changes, so hashes
 * cannot cover them and the supported answer is a per-request nonce.
 * A nonce forces every route to render dynamically, which is the wrong
 * trade for a static marketing page with no user data on it. The gap is
 * written down here rather than left to be discovered.
 *
 * Fonts are self-hosted by next/font at build time, so font-src stays
 * on 'self' with no Google origin in the policy.
 */
/**
 * The tour video, its poster and its captions may be hosted anywhere.
 * Their origins are derived from the same environment variables the
 * page reads, so the policy opens exactly the hosts in use and nothing
 * more. Point the variables somewhere new and the policy follows on the
 * next build, with no second place to remember.
 */
const originOf = (url: string | undefined) => {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    /* A same-origin path such as /tour.mp4 needs no entry. */
    return null;
  }
};

const mediaOrigins = [
  ...new Set(
    [
      originOf(process.env.NEXT_PUBLIC_TOUR_VIDEO_URL),
      originOf(process.env.NEXT_PUBLIC_TOUR_CAPTIONS_URL),
    ].filter((origin): origin is string => origin !== null),
  ),
];

const imageOrigins = [originOf(process.env.NEXT_PUBLIC_TOUR_POSTER_URL)].filter(
  (origin): origin is string => origin !== null,
);

const list = (base: string, extra: string[]) =>
  [base, ...extra].join(" ");

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  list("img-src 'self' data: blob:", imageOrigins),
  list("media-src 'self' blob:", mediaOrigins),
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      /* Nothing from the API is cacheable. */
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      /* Screenshots and brand assets change only when we replace them,
         and Next serves /public with must-revalidate by default, which
         costs a round trip per asset on every repeat visit. A day of
         cache with a week of stale-while-revalidate is the right trade:
         replacing a file is a deploy, and a deploy is rare. */
      {
        source: "/:path(screens|brand)/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
