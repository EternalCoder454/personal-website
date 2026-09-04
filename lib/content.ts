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
  { name: "Marketing", note: "Positioning, campaigns, and the story you tell." },
  { name: "Finance", note: "Pricing, margin, runway, and the maths behind a spend." },
  { name: "Legal", note: "Contracts, terms, and where a clause will cost you." },
  { name: "Operations", note: "Suppliers, workflow, and the week that keeps breaking." },
  { name: "Engineering", note: "Architecture, estimates, and what a choice commits you to." },
  { name: "Design", note: "Interfaces, brand, and what a screen is really asking." },
  { name: "Social Media", note: "Channels that pay, and channels that only look busy." },
];

export const problem = {
  headline: "You can build it. You just can't price it.",
  body: "Most owners are excellent at one or two things and improvising the rest. You know your product cold and guess at the contract. You can sell, but the cash flow model is a spreadsheet you avoid. Hiring a head of finance to answer four questions a month is absurd, so the questions go unanswered.",
  kicker: "Eterneon is the bench you would hire if you could afford it.",
};

export const steps = [
  { n: "01", title: "Add your API key", body: "One key from Anthropic, OpenAI or Google. Encrypted, and never shown again." },
  { n: "02", title: "Describe your business", body: "Ten minutes once, and the heads stop answering like a search engine." },
  { n: "03", title: "Ask", body: "One head in its own thread, or the whole room at once." },
  { n: "04", title: "Keep it", body: "Answers become tasks, files and decisions. Export any of it to Word." },
];

export const capabilities = [
  "Meetings where the whole room answers at once",
  "A shared library and a task board the heads already know about",
  "Briefings waiting for you on Monday, and memory of what you decided",
  "An internal wiki, a private inbox, and an optional calendar link",
];

export const beta = {
  headline: "Test it with us and you keep it. For good.",
  body: "You pay nothing during the beta. When we launch, every workspace that tested with us stays free for life, with three seats at no cost.",
  anchor: "That's the $9.99 a month, and the $3.99 a seat, that everyone else will pay.",
  caveat: "Model usage is the one exception, and always was. Your key is yours, and your provider bills you directly.",
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
    body: "Every row is scoped to your workspace. That scoping is audited in the code and against the live database.",
  },
  {
    title: "Your key never comes back out",
    body: "AES-256-GCM encryption. Once it goes in, no browser sees it again, including yours.",
  },
  {
    title: "Nobody gets in uninvited",
    body: "Google sign-in only, by invitation. Remove someone and they're out on their next click.",
  },
  {
    title: "Nothing happens on its own",
    body: "Every action is proposed and waits for you. No agent goes off and does things unattended.",
  },
];

export const straight = [
  {
    title: "You need an API key",
    body: "No key, no answers. It's one signup with Anthropic, OpenAI or Google, done once.",
  },
  {
    title: "Permissions hide screens, not data",
    body: "The workspace loads as one document, so a determined person could read what the interface hides. Anyone who must not see something at all needs their own workspace.",
  },
  {
    title: "Google sign-in only",
    body: "No email and password, no SSO, no Microsoft.",
  },
  {
    title: "It's advice, not counsel",
    body: "The Legal and Finance heads help you think. They do not replace a lawyer or an accountant, and we say so inside the product too.",
  },
];

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
    a: "No, and that's the point. You bring your own API key and your provider bills you directly, with nothing added by us. We never mark up your tokens and never meter you.",
  },
  {
    q: "How long does setup take?",
    a: "About twenty minutes. Most of it is writing a page about your business, which is the part that makes the answers good.",
  },
  {
    q: "Is my data mixed in with other businesses?",
    a: "No. Every row is scoped to your workspace, and we audit that both in the code and against the live database.",
  },
  {
    q: "Can I stop a colleague seeing something?",
    a: "Yes, per person: which heads they can work with, and which of eleven areas they can open. Read the note above on what that boundary does and does not cover.",
  },
];
