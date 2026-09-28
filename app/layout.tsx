import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import { site, siteUrl } from "@/lib/site";
import { MotionProvider } from "@/components/motion-provider";
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
  /* The company's defaults. /muster sets its own title, description and
     keywords, because that page is about the product. */
  title: {
    default: site.companyTitle,
    template: `%s · ${site.name}`,
  },
  description: site.companyDescription,
  applicationName: site.name,
  keywords: ["Eterneon", "Muster", "small business software"],
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
  /* Set GOOGLE_SITE_VERIFICATION in Vercel to have Next emit the tag.
     Verifying by DNS TXT instead covers apex and www together and needs
     no deploy, which is why this is the fallback rather than the plan. */
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  /* The real brand kit, wired the way it was handed over. Next emits the
     link tags from this, so there is no hand-written <head> to drift. */
  icons: {
    /* The kit's own favicons. Warm is the dark version and cyan the light
       one, so the tab shows whichever suits the browser's own theme. */
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/eterneon-icon-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/brand/eterneon-icon-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
      { url: "/brand/favicon-32-light.png", type: "image/png", sizes: "32x32", media: "(prefers-color-scheme: light)" },
      { url: "/brand/favicon-32-dark.png", type: "image/png", sizes: "32x32", media: "(prefers-color-scheme: dark)" },
      { url: "/brand/favicon-16-light.png", type: "image/png", sizes: "16x16", media: "(prefers-color-scheme: light)" },
      { url: "/brand/favicon-16-dark.png", type: "image/png", sizes: "16x16", media: "(prefers-color-scheme: dark)" },
    ],
    apple: [{ url: "/brand/apple-touch-icon-180-light.png", sizes: "180x180" }],
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
      description: site.companyDescription,
      logo: `${siteUrl}/brand/eterneon-icon-light.png`,
      email: site.contactEmail,
      slogan: site.tagline,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: site.product,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${siteUrl}/muster`,
      publisher: { "@id": `${siteUrl}/#organization` },
      description:
        "AI department heads for small business. Each workspace gets a room of AI department heads, meetings, a shared library, tasks and a wiki, running on the business's own model API key.",
      offers: [
        {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          name: "Private beta",
          description:
            "Free during the beta, and free for life for every workspace that tests with us, with up to three seats at no cost.",
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
        {/* The provider lives here rather than in page.tsx because
            the header is site-wide and its wordmark animates. `m.*`
            under `strict` throws without a LazyMotion ancestor, so a
            provider scoped to one route would have broken the legal
            pages the moment the header appeared on them. */}
        {/* Each route group brings its own header: the company pages and
            the Muster pages look different on purpose. */}
        <MotionProvider>{children}</MotionProvider>
        <script
          type="application/ld+json"
          /* Static object built above, not user input. */
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
