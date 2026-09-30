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
  { name: "Chief of Staff", note: "Flags where the other seven disagree." },
  { name: "Marketing", note: "Positioning and campaigns." },
  { name: "Finance", note: "Pricing, margin, runway." },
  { name: "Legal", note: "Contracts, terms, costly clauses." },
  { name: "Operations", note: "Suppliers, workflow, hiring." },
  { name: "Engineering", note: "Architecture, estimates, technical cost." },
  { name: "Design", note: "Interfaces and brand." },
  { name: "Social Media", note: "Which channels are worth your time." },
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
  body: [
    "A fractional finance lead runs $1,500 to $3,000 a month, and a lawyer averages $422 an hour in California.",
    "So you guess at the contract, put off the forecast and price by feel, or ask a chatbot that has never heard of your business.",
  ],
  /* A reader seeing two exact prices on a page about Finance and Legal
     will ask where they came from, so the page says and links to it.
     Both pages were read before linking, and each states its figure
     outright: Clio gives $422 as the 2025 California lawyer average, and
     MB Accounting Group gives $1,500 to $3,000 a month for revenue under
     $1M. A pricing guide from the same searches was not used: its lowest
     tier starts at $3M revenue, so it does not back the range here.
     Strings are plain text, objects are links. */
  sources: [
    "Sources: ",
    { text: "Clio, 2025 California average", href: "https://www.clio.com/resources/legal-trends/compare-lawyer-rates/ca/" },
    " for the lawyer rate, ",
    { text: "2026 fractional CFO pricing, businesses under $1M in revenue", href: "https://mbaccountinggroup.com/fractional-cfo-cost-small-business/" },
    " for the finance range.",
  ] as Array<string | { text: string; href: string }>,
  /* No price here. The beta offer has its own section with the cards and
     the model usage caveat, and saying $9.99 here as well read as a pitch
     before the problem had finished landing. */
  kicker: "Muster is a company of AI department heads you can ask instead.",
  caveat: "It doesn’t replace those people; it gets you most of the way in minutes, so you know what to ask when you pay for an hour.",
};

/* Straight after the problem, because it is the answer to its last
   line: a chatbot that has never heard of your business. None of the
   questions in these replies carries a number, so every figure the heads
   quote came from the workspace. The replies are cropped, not edited. */
export const answers = {
  headline: "Four heads, one business",
  intro: "Real replies, cropped, not edited. No question gives a number, yet the heads knew the business has 61 clients, wants 150, and can’t hire until one plan reaches 40.",
};

/* Agentic mode, the part where the heads stop suggesting and start doing.
   Every line here is something the panel does today, off by default and
   switched on per business. */
export const agentic = {
  headline: "Agentic mode",
  items: [
    { title: "Hand a task over", body: "The head works it, then marks it done or says what it needs." },
    { title: "Advice filed as tasks", body: "Briefings file their recommendations, and the Chief of Staff boards what a meeting agrees." },
    { title: "Heads ask each other", body: "A marketing answer can include Finance’s view of the margin." },
    { title: "Decisions noted", body: "Decisions and figures given in passing go on the record every head reads." },
  ],
  note: "Off until you turn it on. Every change has Undo. Any head can be kept asking first, rewriting a finished document always asks, and it stops at your monthly budget.",
};

/* The kinds of business Muster is set up for, from the panel's kits. Every
   one here is a kit that ships: the heads learn the trade, and the business
   gets its playbooks and rhythms. Keep this in step with src/lib/kits. */
export const kinds = {
  headline: "Built for your kind of business",
  groups: [
    { title: "Trades and home services", body: "Gardeners and landscapers, painters and decorators, cleaners, builders, plumbers, electricians, HVAC." },
    { title: "Professional services", body: "Law firms, accountants and bookkeepers, consultants and coaches, agencies, estate agents." },
    { title: "Shops and hospitality", body: "Online shops, counter shops, cafés, restaurants, food trucks." },
    { title: "Health and personal care", body: "Salons and barbers, health practices, fitness studios, personal trainers." },
    { title: "Creative and digital", body: "Photographers, videographers, designers, software and app businesses." },
  ],
  examples: [
    {
      who: "A painter",
      gets: "Quote a Job (preparation priced as its own line), Monday Job Board, lead-paint check on older houses, quote follow-up.",
    },
    {
      who: "A law firm",
      gets: "Conflict Check, Fee Proposal, Month-End Billing and Collections, Weekly Matter Review; heads keep client details out and never work out a court deadline.",
    },
  ],
  note: "Pick yours at the start or change it later. You see what it adds first, and your edits are left alone.",
};

export const steps = [
  { n: "01", title: "Add your API key", body: "Anthropic, OpenAI, Google or DeepSeek." },
  { n: "02", title: "Describe your business", body: "About ten minutes, or answers are generic." },
  { n: "03", title: "Ask", body: "One head, or the whole room at once." },
  { n: "04", title: "Let them work", body: "Answers become tasks, files and decisions; agentic mode works them too." },
];

export const capabilities = [
  "A growth goal, planned into tasks and checked weekly",
  "Nightly numbers from Stripe, Shopify or a Google Sheet",
  "Website enquiries with drafted replies",
  "An Outbox of drafted emails, posts and quotes",
  "A first-hire handbook, a weekly opportunity scan",
  "Meetings where the whole room answers",
  "Shared library and task board",
  "Scheduled briefings, decision record",
  "Internal wiki, private inbox, optional calendar link",
  "Optional web search, built in or through Perplexity",
];

export const beta = {
  headline: "Test it during the beta and keep it free",
  body: "Nothing to pay during the beta. Every workspace that tests with us stays free for life, with three seats.",
  /* Answers "free for life, including the AI?" at the price, where the
     question comes up. */
  caveat: "Free for life covers the workspace, not the AI: bring your own key, your provider bills you, we never mark it up.",
};

/* Shown as plain figures. */
export const costs = [
  { amount: 0, decimals: 0, label: "Beta testers, for life, three seats." },
  { amount: 9.99, decimals: 2, label: "A month at launch, everyone else." },
  { amount: 3.99, decimals: 2, label: "Each seat past the three." },
];

export const trust = [
  {
    icon: "/data-isolation.svg",
    title: "Your data is yours alone",
    body: "Kept separate from every other business, and checked every release, in the code and against the live database.",
  },
  {
    icon: "/encrypted-key.svg",
    title: "Your API key is encrypted",
    /* No cipher name, and not "even we can't see it": the server has to
       decrypt the key to call the provider. "Never shown again" is the
       true promise. */
    body: "Encrypted on save, never shown again, not even to you.",
  },
  {
    icon: "/invite-only.svg",
    title: "Access is by invitation only",
    body: "Only invited people get in. Removal ends access on their next request.",
  },
  {
    icon: "/approval.svg",
    title: "You decide what runs on its own",
    body: "Actions wait for your approval unless you turn on agentic mode.",
  },
];

export const straight = [
  {
    icon: "/api-key.svg",
    title: "You need an API key",
    /* Says what a key is first: the one piece of developer language left. */
    body: "Your own pay-as-you-go account with an AI company. Without one the heads can’t answer; signing up takes a few minutes, once.",
  },
  {
    icon: "/hidden-screens.svg",
    title: "Only invite people you trust",
    body: "Hiding a screen doesn’t stop a determined reader. Anyone who must never see something needs their own workspace.",
  },
  {
    icon: "/google-signin.svg",
    title: "Google sign-in only",
    body: "No email and password, no SSO, no Microsoft.",
  },
  {
    icon: "/not-advice.svg",
    title: "It is not professional advice",
    body: "Legal and Finance help you think. They don’t replace a lawyer or an accountant.",
  },
];

export const faqs = [
  {
    q: "Why not just use ChatGPT?",
    a: "One assistant knows nothing about your business and forgets when you close the tab. Muster is eight heads with their own history, sharing one profile and one record of your decisions, and the Chief of Staff flags where they disagree.",
  },
  {
    /* Worded around the work that lands on the reader: other tools'
       features change often. */
    q: "What about custom GPTs or AI employee tools?",
    a: "Custom GPTs leave you pasting the same background into each. AI employee tools hire you a digital worker and mostly meter a monthly credit allowance. Muster runs on your own key, nothing marked up or metered.",
  },
  {
    q: "What does the beta cost, and what’s the catch?",
    a: "Testers keep three seats free for life, and each further seat is $3.99 a month. No credit card during the beta, and Stripe handles later payment, so card details never reach us. The catch: it is unfinished, and the offer stays with the workspace.",
  },
  {
    q: "Does the price include the AI?",
    a: "No. You bring your own API key, your provider bills you directly, and we never mark up or meter usage.",
  },
  {
    q: "How long does setup take?",
    a: "About twenty minutes, mostly writing a page about your business. That page makes the answers good.",
  },
  {
    q: "Who can see my data?",
    a: "No other business, ever. Inside your workspace you set, per person, which heads they can work with and which of eleven areas they can open. Screen hiding has a limit, listed under Security and limits.",
  },
  {
    q: "How do I get my data out?",
    a: "One click exports your whole workspace as one file: every conversation, file, task, decision and wiki page, with no ticket or fee. Your AI access sits outside that, on your key, and the source is published.",
  },
  {
    q: "Is Muster itself built with AI?",
    a: "Yes, a good deal of it, but AI does not decide what ships. Every release runs tests, an audit of every database query for cross-business access, and a live-database check for leftovers. The source is published.",
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
    "I’m Zachary, based in California. Eterneon is a one person business, with no team behind a logo.",
    "I work as an administrative assistant at an accounting practice: not their accountant, but the person who sees which questions small businesses were never asked in time.",
    "The day job pays my bills, so Eterneon doesn’t have to. That’s why it can be $9.99, and why it won’t be shut down for growing slowly.",
    "Every release is in the changelog inside Muster.",
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
      "Four people cover nine jobs, none hired for half of them.",
      "You are still working out what to charge, and why.",
      "Twenty years of the same routine, now new questions.",
      "Unknown outside your trade, relied on by businesses people know.",
    ],
  },
  notForYou: {
    label: "Not for you if",
    items: [
      "You already employ finance, legal and marketing teams.",
      "You need an answer you can hold a professional to.",
      "You want it to run the business unwatched.",
    ],
    note: "If you have those people, ask them. They know your business better.",
  },
};
