import type { Metadata } from "next";
import Link from "next/link";
import { legal, site } from "@/lib/site";
import { LegalPage, Para, Section } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Beta terms",
  description:
    "The terms of the Eterneon private beta: what we promise, what we do not, and what the free-for-life offer actually commits us to.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Beta terms" updated={legal.lastUpdated}>
      <Para>
        Plain terms for a private beta. They cover the invitation and the free-for-life offer made
        on the home page. A full customer agreement will replace them at launch, and nothing here
        takes away a right you have by law.
      </Para>

      <Section title="Who you are contracting with">
        <Para>
          {legal.entity}
          {legal.soleTrader
            ? " is a sole trader business rather than a registered company"
            : legal.companyNumber
              ? `, company number ${legal.companyNumber}`
              : ""}
          {legal.address ? `, of ${legal.address}` : ""}. These terms are governed by the law of{" "}
          {legal.jurisdiction}.
        </Para>
      </Section>

      <Section title="The beta is unfinished, and that is the deal">
        <Para>
          You get the product early and free. In exchange you are using something that will have
          bugs, will change under you, and may lose work. Do not make Eterneon the only place a
          business-critical document exists. Export anything you would be upset to lose.
        </Para>
        <Para>
          The product is provided as it is, without warranty, for the duration of the beta.
        </Para>
      </Section>

      <Section title="What free for life means">
        <Para>
          If your workspace takes part in the beta, it keeps access to the panel at no charge for as
          long as Eterneon runs it, with up to three seats included. A fourth seat and beyond is
          charged at the standard rate. The offer attaches to the workspace rather than to a person,
          so it survives you adding and removing colleagues.
        </Para>
        <Para>
          It does not cover model usage, which you pay your own AI provider for directly and which
          we never see or mark up. It does not oblige us to run the product forever. If we ever
          shut Eterneon down we will give notice and let you export your data.
        </Para>
      </Section>

      <Section title="What we ask of you">
        <Para>
          Use it for a real business. Do not use it to break the law, to harass anybody, or to work
          around your model provider&rsquo;s own terms. Do not share your workspace with people you
          have not invited to it. Tell us when something breaks, because that is the whole point of
          a beta.
        </Para>
      </Section>

      <Section title="Paying, when there is anything to pay">
        <Para>
          Nothing is charged during the beta, and beta workspaces keep three seats free for life. If
          you ever do owe us something, a fourth seat or beyond, billing is handled by Stripe. Card
          details go to Stripe and never reach us. You can cancel at any time, and cancelling does
          not take away the free seats the beta earned you.
        </Para>
      </Section>

      <Section title="Your API key">
        <Para>
          You bring your own key and remain the account holder with Anthropic, OpenAI or Google.
          Their terms and their bills are between you and them. We encrypt the key, never return it
          to any browser, and never use it for anything other than answering inside your workspace.
        </Para>
      </Section>

      <Section title="Cancelling, and refunds">
        <Para>
          You can stop at any time and ask us to delete your workspace. We can end a beta workspace
          if it is being used in a way that breaks these terms, and we will tell you why.
        </Para>
        <Para>
          There are no refunds, and during the beta there is nothing to refund, because nothing is
          charged. Once paid subscriptions begin, cancelling stops the next renewal and your
          workspace stays open until the end of the month you have already paid for. We do not
          refund part of a month, and we never charge you for leaving. There is no notice period
          and no minimum term.
        </Para>
      </Section>

      <Section title="Advice, not counsel">
        <Para>
          The Legal and Finance heads produce advice for a person to weigh. They are not a solicitor
          and not an accountant, and we say so inside the product as well as here.
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
