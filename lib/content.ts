/**
 * Every string on the page.
 *
 * This is marketing copy, so it is written to be scanned rather than
 * read: short sentences, second person, benefit before feature, and
 * contractions where a person would use one. The house rules that still
 * apply are the ones about honesty. No em dashes, say the number rather
 * than saying "later", and no claim the product cannot back.
 */

export type Head = { name: string; note: string };

/** The seeded room. Businesses rename, rewrite, add and remove these. */
export const heads: Head[] = [
  { name: "Chief of Staff", note: "Reads the other seven and tells you where they disagree." },
  { name: "Marketing", note: "Positioning, campaigns, and how you describe what you sell." },
  { name: "Finance", note: "Pricing, margin, runway, and the math behind a decision to spend." },
  { name: "Legal", note: "Contracts, terms, and the clauses that could cost you money." },
  { name: "Operations", note: "Suppliers, workflow, hiring, and the processes that keep breaking." },
  { name: "Engineering", note: "Architecture, estimates, and the long-term cost of a technical choice." },
  { name: "Design", note: "Interfaces, brand, and whether a screen makes sense to the person using it." },
  { name: "Social Media", note: "Which channels are worth your time, and which ones are not." },
];

export const problem = {
  headline: "You need experts. You can’t afford to hire them.",
  body: "A finance lead, a lawyer, a marketer and an operations manager cost more in a month than a lot of small businesses make. So you do all of it yourself. You guess at the contract, put off the cash flow forecast, and set a price because it felt about right. If you are just starting out, you might not know which of those questions to ask first.",
  kicker: "Eterneon is a company of AI department heads you can ask instead. It costs $9.99 a month, and nothing at all if you test it with us during the beta.",
};

export const steps = [
  { n: "01", title: "Add your API key", body: "One key from Anthropic, OpenAI or Google. Encrypted, and never shown again." },
  { n: "02", title: "Describe your business", body: "Spend about ten minutes writing down what your business does. Without it, the answers are generic." },
  { n: "03", title: "Ask", body: "One head in its own thread, or the whole room at once." },
  { n: "04", title: "Keep it", body: "Answers become tasks, files and decisions. Export any of it to Word." },
];

export const capabilities = [
  "Meetings where the whole room answers at once",
  "A shared library and a task board that every head can see",
  "Scheduled briefings, and a record of the decisions you have made",
  "An internal wiki, a private inbox, and an optional calendar link",
];

export const beta = {
  headline: "Test it during the beta and keep it free",
  body: "You pay nothing during the beta. When we launch, every workspace that tested with us stays free for life, with three seats at no cost.",
  anchor: "That's the $9.99 a month, and the $3.99 a seat, that everyone else will pay.",
  caveat: "Model usage is the exception. You bring your own key, and your provider bills you for it directly.",
};

/* amount and decimals drive the count-up. */
export const costs = [
  { amount: 0, decimals: 0, label: "Beta testers, for life. Three seats included." },
  { amount: 9.99, decimals: 2, label: "A month at launch, for everyone else." },
  { amount: 3.99, decimals: 2, label: "Each extra seat, past the three you keep." },
];

export const trust = [
  {
    title: "Your data is yours alone",
    body: "Your data is kept separate from every other business. We check that separation in the code and against the live database.",
  },
  {
    title: "Your API key is encrypted",
    body: "We encrypt it with AES-256-GCM. Once you save it, it is never shown again, including to you.",
  },
  {
    title: "Access is by invitation only",
    body: "You sign in with Google, and only invited people can get in. Remove someone and their access ends on their next request.",
  },
  {
    title: "Nothing happens without your approval",
    body: "Every action is suggested first and waits for you to approve it. Eterneon never acts on its own.",
  },
];

export const straight = [
  {
    title: "You need an API key",
    body: "Without a key, the heads can’t answer. Signing up with Anthropic, OpenAI or Google takes a few minutes, and you only do it once.",
  },
  {
    title: "Permissions hide screens, not data",
    body: "The workspace loads as one document, so a determined person could read what the interface hides. Anyone who must never see something needs their own workspace.",
  },
  {
    title: "Google sign-in only",
    body: "No email and password, no SSO, no Microsoft.",
  },
  {
    title: "It is not professional advice",
    body: "The Legal and Finance heads help you think. They don’t replace a lawyer or an accountant, and we say so inside the product too.",
  },
];

/** A blank line between paragraphs, without wrecking the indentation here. */
const paras = (...parts: string[]) => parts.join("\n\n");

export const faqs = [
  {
    q: "What does the beta cost?",
    a: "Nothing, now or later. Test with us and your workspace stays free for life with three seats. A fourth seat and beyond is $3.99 a month each, same as everyone. No credit card at any point in the beta, and when there is eventually something to pay, Stripe handles it and your card details never reach us.",
  },
  {
    q: "Free for life is a big claim. What's the catch?",
    a: "You're using an unfinished product and telling us where it breaks. That's worth more to us than $9.99 a month. The offer sticks to the workspace, so it survives you adding and removing people.",
  },
  {
    q: "Does the price include the AI?",
    a: "No. You bring your own API key and your provider bills you directly, with nothing added by us. We never mark up your usage and never meter it.",
  },
  {
    q: "Is Eterneon itself built with AI?",
    a: paras(
      "Yes, a good deal of it. It would be odd to sell you a room of AI department heads and then claim I write every line by hand.",
      "The part that matters is what happens next. Every release runs a test suite, an audit that reads every database query to check that one business cannot see another, and a check against the live database for anything left behind where it should not be. The source is published, so you can read it rather than take my word for it.",
      "AI helps me build it faster. It does not decide what ships.",
    ),
  },
  {
    q: "How long does setup take?",
    a: "About twenty minutes. Most of it is writing a page about your business, which is the part that makes the answers good.",
  },
  {
    q: "Is my data mixed in with other businesses?",
    a: "No. Your data is kept separate from every other business, and we check that separation in the code and against the live database.",
  },
  {
    q: "Can I stop a colleague seeing something?",
    a: "Yes, per person: which heads they can work with, and which of eleven areas they can open. Read the note above on what that boundary does and doesn’t cover.",
  },
  {
    q: "What happens if Eterneon shuts down?",
    a: paras(
      "You take everything with you. Your whole workspace exports in one click as a single file: every conversation, file, task, decision and wiki page.",
      "Your AI access is unaffected either way, because the key is yours. You signed up with Anthropic, OpenAI or Google directly, and that relationship does not run through me.",
      "The source is published too, so the panel is not a black box that leaves with me.",
    ),
  },
];

/**
 * The one place on this site that says "I" rather than "we".
 *
 * That is the point of the section, so it is not an oversight. Every
 * other section speaks for the business; this one answers who the
 * business is, and a paragraph about there being no team behind a logo
 * cannot be written in the plural.
 */
export const builder = {
  headline: "Who builds this",
  body: [
    "I’m Zachary, in California. Eterneon is a one person business, and that is the honest version: there is no team behind a logo.",
    "I work as an administrative assistant at an accounting practice, so I spend my days around small businesses and the things that go wrong in them. Not as their accountant. As the person who sees which questions they were never asked in time.",
    "That day job also means this doesn’t have to pay my rent. Eterneon can be $9.99 because it isn’t carrying a salary, and it won’t be abandoned because a growth target got missed.",
    "Every release is in the changelog inside the panel, and the source is published so you can read it. Your whole workspace exports in one click, as one file. And because the API key is yours, your AI access is a direct relationship with your provider that does not depend on me being here.",
  ],
  /* Split so "email me" can carry the address. The section promises a
     reply and then made the reader go looking for where to send it. */
  close: {
    lead: "If something breaks, you ",
    link: "email me",
    rest: " and I answer. There is nobody to pass it to.",
  },
};
