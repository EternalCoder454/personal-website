import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

/* Two typefaces. Geist is the brand face from the kit: it carries the
   wordmark and every piece of UI. Newsreader carries editorial headlines
   only, which is the one thing the kit does not specify. Two families,
   two requests on the critical path. */
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  style: ["normal"],
  variable: "--font-newsreader",
});

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "AI panel",
    "AI for small business",
    "bring your own API key",
    "AI department heads",
    "AI chief of staff",
    "small business software",
  ],
  alternates: {
    canonical: "/",
  },
  /* Only the parts that are genuinely site-wide. Setting title,
     description or url here makes every child page inherit them
     verbatim, which had /privacy advertising the home page title and
     an og:url that contradicted its own canonical. Next derives those
     three from each page metadata instead. */
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
  },
  twitter: {
    /* The default is a small square thumbnail. This is the wide card. */
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "business software",
  /* The real brand kit, wired the way it was handed over. Next emits the
     link tags from this, so there is no hand-written <head> to drift. */
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/eterneon-mark-simple-light.svg", type: "image/svg+xml" },
      { url: "/eterneon-mark-simple-light-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/eterneon-mark-simple-light-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/eterneon-mark-simple-light-180x180.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#171a1c",
  colorScheme: "dark",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: site.name,
      url: siteUrl,
      description: site.description,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: `${site.name} AI Panel`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: site.appUrl,
      publisher: { "@id": `${siteUrl}/#organization` },
      description:
        "A multi-tenant AI business panel. Each workspace gets a room of AI department heads, meetings, a shared library, tasks and a wiki, running on the business's own model API key.",
      offers: [
        {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          name: "Private beta",
          description:
            "Free during the beta, and free for life for every workspace that tests with us, with up to four seats at no cost.",
          availability: "https://schema.org/PreOrder",
        },
        {
          "@type": "Offer",
          price: "9.99",
          priceCurrency: "USD",
          name: "Subscription at launch",
          description:
            "Base subscription, one seat included. Each additional seat is $3.99 a month.",
          availability: "https://schema.org/PreOrder",
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${newsreader.variable}`}
    >
      <head>
        {/* Motion renders its initial state into the static HTML, which
            means 47 elements ship at opacity:0 including the headline
            and all three forms. If the script fails, is blocked, or is
            simply slow, the page is blank and there is no way to convert.
            This puts them back for anyone without JS. */}
        <noscript>
          <style>{"[style*=\"opacity:0\"]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-[var(--radius-sm)] focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          /* Static object built above, not user input. */
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
