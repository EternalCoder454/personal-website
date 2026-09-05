import type { Metadata } from "next";
import Link from "next/link";
import { legal, site } from "@/lib/site";
import { LegalPage, Para, Section } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Eterneon collects when you ask for beta access, why, how long it is kept, and how to have it deleted.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated={legal.lastUpdated}>
      <Para>
        This notice covers this website only. It describes what happens when you ask for beta
        access. The panel itself, at{" "}
        <span className="text-on-surface">business.eterneon.net</span>, has its own notice inside
        the product.
      </Para>

      <Section title="Who is responsible">
        <Para>
          {legal.entity}
          {legal.soleTrader
            ? ", a sole trader business rather than a registered company,"
            : legal.companyNumber
              ? `, company number ${legal.companyNumber},`
              : ","}{" "}
          {legal.address ? `of ${legal.address}, ` : ""}is the data controller. Questions and
          requests, including a request for a postal address, go to{" "}
          <a className="underline decoration-outline underline-offset-4 hover:text-primary hover:decoration-primary" href={`mailto:${legal.privacyEmail}`}>
            {legal.privacyEmail}
          </a>
          .
        </Para>
      </Section>

      <Section title="What this site collects">
        <Para>
          One thing: the email address you type into the beta form. Nothing else on the form is
          asked for, because nothing else is needed to send you an invitation.
        </Para>
        <Para>
          The server also records your IP address briefly when the form is submitted, to stop the
          same address being submitted hundreds of times. It is held in memory for ten minutes and
          is not written to a database.
        </Para>
        <Para>
          The site also counts page views, using Vercel Web Analytics. A view records the page you
          looked at, where you arrived from, your browser and device type, and an approximate
          location worked out from your connection, as far as the city. It does not record your IP
          address. Visitors are counted using a hash of the request, which Vercel discards after
          twenty four hours, so the same person returning the next day is a new number and cannot
          be joined to the previous one.
        </Para>
        <Para>
          When performance sampling is switched on, the server times its own work: a route name
          like &ldquo;/privacy&rdquo; and a duration in milliseconds. No IP address, no browser or
          device details, no referrer and no identifier of any kind goes into it, so it cannot be
          traced to you or to anybody else. It lives in memory, it is capped at a couple of
          thousand entries, and it disappears when the server restarts.
        </Para>
      </Section>

      <Section title="What it does not collect">
        <Para>
          There are no advertising pixels and no trackers that follow you to other sites. The
          page view counter described above is served from this domain rather than somebody
          else&rsquo;s, and it is the only script here that is not part of the page itself. Nothing
          is stored on your device: no cookies are set, and nothing is written to local storage.
          There is no cookie banner because there is nothing on your device to consent to. The
          performance timings above are the server measuring itself, never you.
        </Para>
      </Section>

      <Section title="Why, and on what basis">
        <Para>
          Your address is used to send you a beta invitation and to answer you if you write back.
          It is not used for a newsletter, not used for marketing anything else, and not sold,
          rented or shared with anyone for their own purposes. The lawful basis is your consent,
          given by submitting the form, and you can withdraw it at any time.
        </Para>
      </Section>

      <Section title="Who else sees it">
        <Para>
          This site runs on Vercel, which serves the page, keeps short-lived server logs, and
          receives the page view counts described above. When
          you submit the form, your address is emailed to us through Resend, which is the same
          email provider the panel uses. Both act on our instructions and do not use your address
          for their own purposes.
        </Para>
        <Para>
          If you later become a customer, Stripe processes the payment. Your card details go to
          Stripe directly and never reach us: we never see or store a card number. Stripe is the
          controller of that payment data under its own privacy policy.
        </Para>
        <Para>
          Your AI provider, which is Anthropic, OpenAI or Google depending on the key you bring,
          receives whatever you send the heads inside the panel. That relationship is yours, under
          their terms, and it is billed to you directly. We never mark it up and never meter it.
        </Para>
      </Section>

      <Section title="How long it is kept">
        <Para>
          Until the beta closes, or until you ask for it to be deleted, whichever comes first. If
          you are invited and become a customer, your address moves into the product and the
          product&rsquo;s own notice takes over. If the beta ends without inviting you, the list is
          deleted.
        </Para>
      </Section>

      <Section title="Your rights">
        <Para>
          You can ask for a copy of what is held about you, ask for it to be corrected, ask for it
          to be deleted, or object to it being held at all. Email{" "}
          <a className="underline decoration-outline underline-offset-4 hover:text-primary hover:decoration-primary" href={`mailto:${legal.privacyEmail}`}>
            {legal.privacyEmail}
          </a>{" "}
          and we will action it within 30 days. You do not have to give a reason, and asking costs
          you nothing.
        </Para>
        <Para>
          Eterneon is based in California. If you are a California resident, the CCPA gives you the
          right to know what is held about you, to have it deleted, and to correct it. We do not
          sell or share personal information and never have, so there is no opt-out to exercise. If
          you are in the UK you can complain to the Information Commissioner&rsquo;s Office, and if
          you are in the EU to your national supervisory authority. We would rather you told us
          first, but that is your choice and not a condition.
        </Para>
      </Section>

      <Section title="Changes">
        <Para>
          If this notice changes in a way that affects what we do with an address already on the
          list, we will email the people on it. Small corrections will just be made, with the date
          at the top updated.
        </Para>
      </Section>

      <Para>
        <Link
          href="/"
          className="underline decoration-outline underline-offset-4 hover:text-primary hover:decoration-primary"
        >
          Back to {site.name}
        </Link>
      </Para>
    </LegalPage>
  );
}
