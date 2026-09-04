/**
 * Site-level constants.
 *
 * The explicit variable comes first because the platform variable can
 * resolve to a preview domain, which would put the wrong host in every
 * canonical link, sitemap entry and share card.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3050");

/**
 * The legal identity behind the site.
 *
 * Eterneon is a sole trader business, not a registered company, so there
 * is no company name distinct from the trading name and no company
 * number. That is a normal thing to be and the pages say so plainly
 * rather than leaving a gap where a reader expects a company.
 *
 * address is deliberately empty. A privacy notice needs the controller
 * identity and a way to reach them, and an email address satisfies that.
 * A sole trader working from home should not have to publish a home
 * address to run a beta. Fill it in only if there is a business address
 * that is not somebody house.
 */
export const legal = {
  entity: "Eterneon",
  soleTrader: true,
  /* Empty is fine and renders nothing. Do not put a home address here. */
  companyNumber: "",
  address: "",
  jurisdiction: "the State of California, United States",
  privacyEmail: "hello@eterneon.net",
  lastUpdated: "3 September 2026",
} as const;

/**
 * Social proof, shown only once it is real.
 *
 * Leave at 0 until the number is both true and not embarrassing. The
 * component renders nothing while it is 0, so there is no placeholder
 * to forget about.
 */
export const proof = {
  businessesTesting: 0,
} as const;

export type Screenshot = {
  src: string;
  alt: string;
  caption: string;
  /* The card image on the page. */
  width: number;
  height: number;
  /* The -full twin the lightbox loads. These have to be the real
     dimensions of that file: passing the card size instead caps the
     rendered width at the attribute value, so "actual size" quietly
     showed the same pixels as the card. */
  fullWidth: number;
  fullHeight: number;
};

/**
 * Real captures of a real workspace, cropped and converted in
 * scripts/screenshots. Intrinsic width and height are recorded so the
 * boxes are reserved before the files land and nothing shifts.
 */
export const screenshots: Screenshot[] = [
  {
    src: "/screens/marketing.webp",
    alt: "The Marketing head answering a question about how to position a pricing tier, with its reasoning shown above the answer.",
    caption: "Ask one head. It answers from its own corner, and shows you the thinking above the answer.",
    width: 1500,
    height: 1027,
    fullWidth: 2600,
    fullHeight: 1780,
  },
  {
    src: "/screens/finance.webp",
    alt: "The Finance head working out monthly revenue in a table, flagging which numbers are assumptions.",
    caption: "It does the maths, and marks which numbers it assumed rather than quietly inventing them.",
    width: 1500,
    height: 1006,
    fullWidth: 2600,
    fullHeight: 1743,
  },
  {
    src: "/screens/engineering.webp",
    alt: "The Engineering head answering a question about release risk, with buttons to copy, save as a deliverable, or record a decision.",
    caption: "Keep what is worth keeping. An answer becomes a task, a file, or a recorded decision.",
    width: 1500,
    height: 1071,
    fullWidth: 2600,
    fullHeight: 1857,
  },
];

/** The three that stack behind the headline. */
export const heroShots: Screenshot[] = [
  {
    src: "/screens/chief-of-staff.webp",
    alt: "The Chief of Staff summarising the week and saying plainly which areas it has no visibility into.",
    caption: "",
    width: 1500,
    height: 867,
    fullWidth: 2600,
    fullHeight: 1503,
  },
  {
    src: "/screens/tasks.webp",
    alt: "The task board, with columns for to do, ongoing and done.",
    caption: "",
    width: 1500,
    height: 417,
    fullWidth: 2600,
    fullHeight: 722,
  },
  {
    src: "/screens/context.webp",
    alt: "A breakdown of what each department head knows, and what it costs in tokens.",
    caption: "",
    width: 1300,
    height: 1091,
    fullWidth: 2180,
    fullHeight: 1830,
  },
];

export const site = {
  name: "Eterneon",
  /* Under 60 characters. */
  title: "Eterneon: the department heads your business is missing",
  /* 150 to 160 characters. */
  description:
    "Marketing, Finance, Legal, Operations and four more, as AI department heads in one private workspace. Free for life for beta testers. No credit card.",
  appUrl: "https://business.eterneon.net",
  contactEmail: "hello@eterneon.net",
  /* The kit tagline, from the horizontal lockup. */
  tagline: "Systems for small business",
} as const;

/**
 * The product tour that plays in the overlay.
 *
 * There is no film yet. While `src` is empty the proof section does not
 * render at all, because a section promising to show you the product and
 * then showing a placeholder reads worse than never promising. Set the
 * two URLs and it appears by itself.
 *
 * `src` can be any URL a <video> can play: a file in /public, a Vercel
 * Blob URL, or a CDN. `captions` should be a WebVTT file, because a
 * tour with no captions excludes people who need them and anybody
 * watching without sound.
 */
export const tour = {
  src: process.env.NEXT_PUBLIC_TOUR_VIDEO_URL ?? "",
  poster: process.env.NEXT_PUBLIC_TOUR_POSTER_URL ?? "",
  captions: process.env.NEXT_PUBLIC_TOUR_CAPTIONS_URL ?? "",
  title: "Two minutes inside a workspace",
  blurb: "Asking one head, calling a meeting, and what happens to the answers afterwards.",
  /* Shown next to the play control. Leave empty until the cut is final,
     because a wrong number is worse than no number. */
  length: "",
} as const;

/**
 * Whether there is anything to show.
 *
 * This lives here rather than in components/tour.tsx on purpose. A plain
 * value exported from a "use client" module and read by a Server
 * Component arrives as a client-reference proxy, not the boolean: the
 * proxy is truthy, so `if (!hasTour)` never fired and the proof section
 * rendered an empty promise. Plain module, plain boolean.
 */
export const hasProof = tour.src.length > 0 || screenshots.length > 0;

/* There is no navigation. One page, one action, nowhere else to go. */
