import {
  Agentic,
  Answers,
  Builder,
  Close,
  Faq,
  Fit,
  Hero,
  Offer,
  Problem,
  Room,
  Steps,
  Straight,
  Proof,
  Trust,
} from "@/components/sections/sections";
import { SiteFooter } from "@/components/site-footer";
import { TourProvider } from "@/components/tour";
import { LightboxProvider } from "@/components/lightbox";
import { faqs } from "@/lib/content";
import type { Metadata } from "next";
import { og, site, siteUrl } from "@/lib/site";

/* The product page. It was the whole site at / until the company home took
   that address, so it now names its own title, description and canonical
   rather than inheriting the company's. */
export const metadata: Metadata = {
  title: { absolute: site.title },
  description: site.description,
  keywords: [
    "Muster",
    "AI for small business",
    "bring your own API key",
    "AI department heads",
    "AI chief of staff",
    "small business software",
  ],
  alternates: { canonical: "/muster" },
  openGraph: og("/muster"),
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${siteUrl}/muster#faq`,
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    /* Answers are stored with blank lines between paragraphs. Schema
       wants one run of text, not the page's line breaks. */
    acceptedAnswer: { "@type": "Answer", text: faq.a.replace(/\s+/g, " ").trim() },
  })),
};

export default function MusterPage() {
  return (
    <TourProvider>
      <LightboxProvider>
      <main id="main" tabIndex={-1}>
        {/* Order is the argument: the problem, real replies that answer it,
           and the product first, then
           who it is for while the reader is still deciding whether it applies
           to them, then setup, security and limits, then who is behind it and
           why it can cost $9.99, and only then the price. */}
        <Hero />
        <Problem />
        <Answers />
        <Proof />
        <Room />
        <Agentic />
        <Fit />
        <Steps />
        <Trust />
        <Straight />
        <Builder />
        <Offer />
        <Faq />
        <Close />
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      </LightboxProvider>
    </TourProvider>
  );
}
