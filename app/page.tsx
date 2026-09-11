import {
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
import { og, siteUrl } from "@/lib/site";

/* Only Open Graph. Title, description and canonical come from the root
   layout, which is correct for the home page and only the home page. */
export const metadata = { openGraph: og("/") };

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
