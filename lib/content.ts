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
  headline: "You can’t afford the experts you need",
  /* Real US rates. The lawyer figure is Clio’s California average as of 2025,
     $422 against a US average of $349, which is why the state stays in
     the sentence: without it the number overstates. The finance band is
     the one quoted for businesses under $1M in revenue. Two figures, not
     three: the contract review number turned the paragraph into a price
     list. The last sentence is the second bad option, the free one most
     readers have already tried. */
  body: "A fractional finance lead runs $1,500 to $3,000 a month. A lawyer averages $422 an hour in California. So you guess at the contract, put off the forecast, and set a price because it felt about right. Or you ask a chatbot that has never heard of your business.",
  /* A reader seeing two exact prices on a page about Finance and Legal
     will ask where they came from, so the page says and links to it.
     Both pages were read before linking, and each states its figure
     outright: Clio gives $422 as the 2025 California lawyer average, and
     MB Accounting Group gives $1,500 to $3,000 a month for revenue under
     $1M. A pricing guide from the same searches was not used: its lowest
     tier starts at $3M revenue, so it does not back the range here.
     Strings are plain text, objects are links. */
  sources: [
    "Where the numbers come from: the lawyer rate is ",
    { text: "Clio’s 2025 average for California", href: "https://www.clio.com/resources/legal-trends/compare-lawyer-rates/ca/" },
    ", and the finance range is ",
    { text: "2026 fractional CFO pricing for businesses under $1M in revenue", href: "https://mbaccountinggroup.com/fractional-cfo-cost-small-business/" },
    ".",
  ] as Array<string | { text: string; href: string }>,
  /* No price here. The beta offer has its own section with the cards and
     the model usage caveat, and saying $9.99 here as well read as a pitch
     before the problem had finished landing. */
  kicker: "Muster is a company of AI department heads you can ask instead.",
  caveat: "It doesn’t replace those people, and it says so. It gets you most of the way in minutes, so when you do pay for an hour, you already know what to ask.",
};

/* Straight after the problem, because it is the answer to its last
   line: a chatbot that has never heard of your business. None of the
   questions in these replies carries a number, so every figure the heads
   quote came from the workspace. The replies are cropped, not edited. */
export const answers = {
  headline: "Four heads, one business",
  intro: "Real replies from one workspace, cropped but not edited. None of the questions gives a number. The heads already knew the business has 61 clients, wants 150, and can’t hire until one plan reaches 40 clients.",
};

export const steps = [
  { n: "01", title: "Add your API key", body: "One key from Anthropic, OpenAI, Google or DeepSeek. Encrypted, and never shown again." },
  { n: "02", title: "Describe your business", body: "Spend about ten minutes writing down what your business does. Without it, the answers are generic." },
  { n: "03", title: "Ask", body: "One head in its own thread, or the whole room at once." },
  { n: "04", title: "Keep it", body: "Answers become tasks, files and decisions. Export any of it to Word." },
];

export const capabilities = [
  "Meetings where the whole room answers at once",
  "A shared library and a task board that every head can see",
  "Scheduled briefings, and a record of the decisions you have made",
  "An internal wiki, a private inbox, and an optional calendar link",
  "Optional web search, built in or through Perplexity",
];

export const beta = {
  headline: "Test it during the beta and keep it free",
  body: "You pay nothing during the beta. When we launch, every workspace that tested with us stays free for life, with three seats at no cost.",
  /* Answers "free for life, including the AI?" at the price, where the
     question comes up. */
  caveat: "Free for life covers the workspace. The AI is yours: you bring your own key, your provider bills you directly, and we never mark it up.",
};

/* amount and decimals drive the count-up. */
export const costs = [
  { amount: 0, decimals: 0, label: "Beta testers, for life. Three seats included." },
  { amount: 9.99, decimals: 2, label: "A month at launch, for everyone else." },
  { amount: 3.99, decimals: 2, label: "Each extra seat, past the three you keep." },
];

export const trust = [
  {
    icon: "/data-isolation.svg",
    title: "Your data is yours alone",
    body: "Your data is kept separate from every other business. Every release checks that, in the code and against the live database.",
  },
  {
    icon: "/encrypted-key.svg",
    title: "Your API key is encrypted",
    /* No cipher name: nobody this page is for knows what AES-256-GCM
       means. And not "even we can't see it": the server has to decrypt
       the key to call the provider, so that would be a promise the
       product cannot keep. "Never shown again" is the true one. */
    body: "It is encrypted the moment you save it, and Muster never shows it again, not even to you.",
  },
  {
    icon: "/invite-only.svg",
    title: "Access is by invitation only",
    body: "You sign in with Google, and only invited people can get in. Remove someone and their access ends on their next request.",
  },
  {
    icon: "/approval.svg",
    /* Was "Nothing happens without your approval". True until agentic mode
       shipped, and still the default, so the default leads and the choice
       follows. The rewrite exception is named because it is the one thing
       a buyer would worry about: work being overwritten with no copy. */
    title: "You decide what runs on its own",
    body: "By default, every action is suggested first and waits for you to approve it. Turn on agentic mode and the heads act as they go, then tell you what they did. Rewriting a finished document always asks first.",
  },
];

export const straight = [
  {
    icon: "/api-key.svg",
    title: "You need an API key",
    /* Says what a key is first. A contractor or a shop owner reading
       this has no reason to know, and "API key" with no explanation is
       the one piece of developer language left on the page. */
    body: "An API key is your own pay-as-you-go account with an AI company, so you pay only for what you use. Without one, the heads can’t answer. Signing up with Anthropic, OpenAI, Google or DeepSeek takes a few minutes, and you only do it once.",
  },
  {
    icon: "/hidden-screens.svg",
    /* Was "Permissions hide screens, not data", which is accurate and
       reads like a developer's note. The advice is the useful part, so it
       leads, and the candid admission stays in plain words. */
    title: "Only invite people you trust",
    body: "Everyone in a workspace can get to the same business information. Hiding a screen from someone doesn’t stop a determined person reading it. If someone must never see something, give them their own workspace.",
  },
  {
    icon: "/google-signin.svg",
    title: "Google sign-in only",
    body: "No email and password, no SSO, no Microsoft.",
  },
  {
    icon: "/not-advice.svg",
    title: "It is not professional advice",
    body: "The Legal and Finance heads help you think. They don’t replace a lawyer or an accountant, and we say so inside the product too.",
  },
];

/** A blank line between paragraphs, without wrecking the indentation here. */
const paras = (...parts: string[]) => parts.join("\n\n");

export const faqs = [
  {
    /* Was two questions. The general chatbot and the AI employee tools
       are different incumbents, but a reader weighing either is asking
       the same thing, and ten questions in a list is a wall. */
    q: "Why not just use ChatGPT?",
    a: paras(
      "Because one assistant knows nothing about your business and forgets the conversation when you close the tab. You re-explain what you sell, who you sell it to, and what you already decided, every time you open it.",
      "This is eight of them. Each runs a department, keeps its own history with you, and remembers what you decided. They all read the same company profile before they answer, so a pricing question reaches Finance already knowing your margins. And you can put them in a room: ask all eight the same thing and the Chief of Staff reads the seven answers and tells you where they disagree.",
      /* The sharper version of the objection. Worded around the work that
         lands on the reader, not around what ChatGPT lacks: its features
         change often, and a claim about them could be wrong next month. */
      "You could set up eight custom GPTs, and then you would be the one keeping them in step: pasting the same background into each, remembering what one told you when you ask another, and copying answers into your own notes. Here the heads share one profile and one record of your decisions, answer the same question side by side, and turn answers into tasks and decisions your team can see.",
      "The AI employee tools are a different shape again. Those hire you a digital worker to do a task, and most of them meter you with a credit allowance that resets each month. These answer questions where being wrong costs money, on a key you own, with nothing marked up and nothing metered.",
    ),
  },
  {
    q: "What does the beta cost, and what’s the catch?",
    a: paras(
      "Nothing, now or later. Test with us and your workspace stays free for life with three seats. A fourth seat and beyond is $3.99 a month each, same as everyone. No credit card at any point in the beta, and when there is eventually something to pay, Stripe handles it and your card details never reach us.",
      "The catch is that you are using an unfinished product and telling us where it breaks. That is worth more to us than $9.99 a month. The offer sticks to the workspace, so it survives you adding and removing people.",
    ),
  },
  {
    q: "Does the price include the AI?",
    a: "No. You bring your own API key and your provider bills you directly, with nothing added by us. We never mark up your usage and never meter it.",
  },
  {
    q: "How long does setup take?",
    a: "About twenty minutes. Most of it is writing a page about your business, which is the part that makes the answers good.",
  },
  {
    /* Was two questions, one about other businesses and one about
       colleagues. Both are "who can see this", and merging them puts
       the permissions caveat inline instead of pointing up the page. */
    q: "Who can see my data?",
    a: paras(
      "No other business, ever. Your data is kept separate from every other workspace, and we check that separation in the code and against the live database.",
      "Inside your own workspace you set it per person: which heads they can work with, and which of eleven areas they can open. One limit worth knowing, and it is in the list above too: hiding a screen from someone doesn’t stop a determined person reading it. Anyone who must never see something needs their own workspace.",
    ),
  },
  {
    /* Was "What happens if Eterneon shuts down?". The answer was good
       and the question was not: it plants the doubt it then settles,
       and a reader deciding whether to trust a one person business does
       not need the idea handed to them. Same facts, asked the way a
       careful buyer would actually ask it. */
    q: "How do I get my data out?",
    a: paras(
      "One click. Your whole workspace exports as a single file: every conversation, file, task, decision and wiki page. No ticket, no waiting, no export fee.",
      "Your AI access sits outside that entirely, because the key is yours. You signed up with Anthropic, OpenAI, Google or DeepSeek directly, and that relationship does not run through us.",
      "The source is published as well, so none of this is a black box you could be shut out of.",
    ),
  },
  {
    q: "Is Muster itself built with AI?",
    a: paras(
      "Yes, a good deal of it. It would be odd to sell you a room of AI department heads and then claim I write every line by hand.",
      "The part that matters is what happens next. Every release runs a test suite, an audit that reads every database query to check that one business cannot see another, and a check against the live database for anything left behind where it should not be. The source is published, so you can read it rather than take my word for it.",
      "AI helps me build it faster. It does not decide what ships.",
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
  headline: "Who’s behind this",
  body: [
    "I’m Zachary, based in California. Eterneon is a one person business, and that is the honest version: there is no team behind a logo.",
    "I work as an administrative assistant at an accounting practice, so I spend my days around small businesses and the things that go wrong in them. Not as their accountant. As the person who sees which questions they were never asked in time.",
    /* Was "this doesn't have to pay my rent", which is honest and reads
       as a hobby that could wait out a busy month, at a job where tax
       season is a busy month. Same facts, ordered so the day job is the
       reason it lasts rather than a sign it matters less. */
    "The day job pays my bills, so Eterneon doesn’t have to. That’s why it can be $9.99, and why it won’t be shut down for growing slowly.",
    "Every release is in the changelog inside Muster, and the source is published so you can read it. Your whole workspace exports in one click, as one file. And because the API key is yours, your AI access is a direct relationship with your provider that does not depend on me being here.",
  ],
  /* Split so "email me" can carry the address. The section promises a
     reply and then made the reader go looking for where to send it. */
  close: {
    lead: "If something breaks, you ",
    link: "email me",
    rest: " and I answer. There is nobody to pass it to.",
  },
};

/**
 * Who the product is for, and who it is not, as two facing lists.
 *
 * SoloPro Tax puts a fit and a no-fit card side by side, and the
 * no-fit one is the reason it works: turning the wrong reader away in
 * plain sight reads as confidence. Same idea, none of their styling.
 */
export const fit = {
  headline: "Who this is for",
  forYou: {
    label: "It’s for you if",
    items: [
      "Four people cover nine jobs, and nobody was hired to do half of them.",
      "You are still working out what to charge, and why that number and not another.",
      "You have run the same way for twenty years and now have questions you never used to.",
      "Nobody outside your trade has heard of you, and the businesses people have heard of depend on you.",
    ],
  },
  notForYou: {
    label: "Not for you if",
    items: [
      "You already employ a finance team, a legal team and a marketing team.",
      "You need an answer you can hold a professional to.",
      "You want it to run the business while nobody is looking.",
    ],
    note: "If you have those people, ask them. They know your business better than any of this will.",
  },
};
