import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import TopAppBar from "@/components/TopAppBar";
import LiquidBackground from "@/components/LiquidBackground";
import { profile, siteUrl, socials, skills, verification } from "@/lib/site";
import "./globals.css";

/* Runs before first paint, so a stored light theme is applied without the
   page flashing dark first. No stored value means dark, which is what bare
   :root already is. */
const THEME_INIT = `
try {
  /* Play the intro once per visit, not on every reload. */
  if (sessionStorage.getItem("intro")) document.documentElement.dataset.intro = "seen";
  else sessionStorage.setItem("intro", "1");
} catch (e) {}
try {
  var t = localStorage.getItem("theme");
  if (t === "light" || t === "dark") {
    document.documentElement.dataset.theme = t;
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "light" ? "#fef7ff" : "#141218");
  }
} catch (e) {}
`;

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    /* A bare name ranks for nothing. The default carries what the site is
       actually about; inner pages still read "Gallery · EternalHell". */
    default: `${profile.name} - Pixel Art, Minecraft Builds & Web Design`,
    template: `%s · ${profile.name}`,
  },
  description:
    "Pixel art, Minecraft builds and web design by EternalHell, founder of Eterneon Studios. Commissions open.",
  alternates: { canonical: "/" },
  icons: { icon: profile.avatar },
  openGraph: {
    title: profile.name,
    description:
      "Pixel art, Minecraft builds and web design by EternalHell, founder of Eterneon Studios.",
    type: "website",
    siteName: profile.brand,
    url: siteUrl,
    /* No images here on purpose: app/opengraph-image.tsx supplies it, and an
       explicit list would override the generated card. */
  },
  /* summary_large_image is what turns the embed into a wide card instead of
     a small square thumbnail. */
  twitter: { card: "summary_large_image", title: profile.name },
  verification: {
    ...(verification.google ? { google: verification.google } : {}),
    ...(verification.bing ? { other: { "msvalidate.01": verification.bing } } : {}),
  },
};

export const viewport: Viewport = {
  /* colorScheme is set in CSS instead, so it follows the chosen theme
     rather than being pinned to dark. */
  themeColor: "#141218",
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: siteUrl,
  image: `${siteUrl}${profile.avatar}`,
  jobTitle: "Founder",
  worksFor: { "@type": "Organization", name: profile.brand },
  knowsAbout: skills.map((s) => s.name),
  sameAs: socials.map((s) => s.href).filter(Boolean),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={roboto.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {/* next/font/google has no icon fonts, so this stays a plain link. It
            only supplies the @font-face - our own .icon class does the styling,
            so their stylesheet can never override our layout.

            display=block is deliberate for an icon font: with swap, the
            ligature names ("castle", "grid_on") flash as literal text before
            the font arrives. no-page-custom-font is a pages-router rule and
            does not apply to a link in an App Router layout. */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/google-font-display, @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body>
        {/* Plain markup, not a client component: it is in the first paint and
            its dismissal is a CSS animation, so a JS failure cannot leave the
            site covered by it. */}
        <div className="intro" aria-hidden="true">
          <span className="intro__mark">{profile.brand}</span>
        </div>

        <LiquidBackground />

        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <TopAppBar />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
