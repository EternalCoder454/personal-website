import {
  Builder,
  Close,
  Faq,
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
import { siteUrl } from "@/lib/site";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${siteUrl}/#faq`,
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    /* Answers are stored with blank lines between paragraphs. Schema
       wants one run of text, not the page's line breaks. */
    acceptedAnswer: { "@type": "Answer", text: faq.a.replace(/\s+/g, " ").trim() },
  })),
};

export default function HomePage() {
  return (
    <TourProvider>
      <LightboxProvider>
      <main id="main" tabIndex={-1}>
        <Hero />
        <Problem />
        <Proof />
        <Room />
        <Steps />
        <Offer />
        <Trust />
        <Straight />
        <Faq />
        <Builder />
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
