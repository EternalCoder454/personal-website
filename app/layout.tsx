import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import TopAppBar from "@/components/TopAppBar";
import LiquidBackground from "@/components/LiquidBackground";
import { profile, siteUrl, socials, skills, verification, iconNames } from "@/lib/site";
import "./globals.css";

/* Runs before first paint so a stored theme never flashes. */
const THEME_INIT = `
try {
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
    /* opengraph-image.tsx supplies it; an explicit list would override. */
  },
  twitter: { card: "summary_large_image", title: profile.name },
  verification: {
    ...(verification.google ? { google: verification.google } : {}),
    ...(verification.bing ? { other: { "msvalidate.01": verification.bing } } : {}),
  },
};

export const viewport: Viewport = {
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
        {/* Supplies only the @font-face; .icon does the styling.
            display=block stops ligature names flashing as text. */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${iconNames.join(",")}&display=block`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body>
        {/* CSS-dismissed, so a JS failure cannot leave it stuck. */}
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
