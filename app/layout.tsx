import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import TopAppBar from "@/components/TopAppBar";
import LiquidBackground from "@/components/LiquidBackground";
import { profile, siteUrl } from "@/lib/site";
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
    default: profile.name,
    template: `%s · ${profile.name}`,
  },
  description: "Founder of Eterneon Studios. Socials, current time, and gallery.",
  icons: { icon: profile.avatar },
  openGraph: {
    title: profile.name,
    description: "Founder of Eterneon Studios.",
    type: "website",
    images: [profile.avatar],
  },
  twitter: { card: "summary" },
};

export const viewport: Viewport = {
  /* colorScheme is set in CSS instead, so it follows the chosen theme
     rather than being pinned to dark. */
  themeColor: "#141218",
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
