import {
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
import { MotionProvider } from "@/components/motion-provider";
import { faqs } from "@/lib/content";
import { siteUrl } from "@/lib/site";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${siteUrl}/#faq`,
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function HomePage() {
  return (
    <MotionProvider>
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
        <Close />
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      </LightboxProvider>
      </TourProvider>
    </MotionProvider>
  );
}
