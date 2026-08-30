import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import TopAppBar from "@/components/TopAppBar";
import { profile, siteUrl } from "@/lib/site";
import "./globals.css";

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
  themeColor: "#141218",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={roboto.variable}>
      <head>
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
        <TopAppBar />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
