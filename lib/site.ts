/**
 * Site-level constants.
 *
 * One variable and a local fallback. There used to be a platform one from
 * Vercel in between, and it went with the platform: it resolved to a
 * preview domain, which would put the wrong host in every canonical
 * link, sitemap entry and share card.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3050";

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
  lastUpdated: "5 September 2026",
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
    src: "/screens/heads.webp",
    alt: "The Departments screen, listing eight heads from Chief of Staff to Engineering, each with a name and a count of its skills.",
    caption: "Eight departments, each with its own brief and its own history.",
    width: 1500,
    height: 937,
    fullWidth: 1637,
    fullHeight: 1023,
  },
  {
    src: "/screens/profile.webp",
    alt: "The company profile, with the mission, what the business sells and where it is today written into plain text fields.",
    caption: "Fill the profile in once. Every head reads it before it answers.",
    width: 1500,
    height: 938,
    fullWidth: 1638,
    fullHeight: 1024,
  },
  {
    src: "/screens/costs.webp",
    alt: "A month of spend broken down by head, each row showing how many replies it gave and what they cost.",
    caption: "What each reply cost, head by head, estimated at list prices.",
    width: 1120,
    height: 700,
    fullWidth: 1120,
    fullHeight: 700,
  },
];

/**
 * The widths scripts/responsive-screens.mjs writes next to each card.
 *
 * Measured on the live site: a proof card renders at 333 CSS pixels on
 * a 375px phone and about 437 on the widest desktop, so 800 covers a 2x
 * phone and 1200 covers a 3x one. Every phone had been pulling the full
 * 1500px file to draw it a third that size.
 */
const RESPONSIVE_WIDTHS = [400, 800, 1200] as const;

/** The candidate list for one card, original included as the largest. */
export const srcSetFor = (shot: Pick<Screenshot, "src" | "width">) => {
  const base = shot.src.replace(/\.webp$/, "");
  return [
    ...RESPONSIVE_WIDTHS.filter((w) => w < shot.width).map((w) => `${base}-${w}w.webp ${w}w`),
    `${shot.src} ${shot.width}w`,
  ].join(", ");
};

/** The three that stack behind the headline. */
export const heroShots: Screenshot[] = [
  {
    src: "/screens/dashboard.webp",
    alt: "The dashboard, showing open tasks, recorded decisions, recent conversations, spend and context per head.",
    caption: "",
    width: 1500,
    height: 819,
    fullWidth: 2600,
    fullHeight: 1420,
  },
  {
    src: "/screens/tasks.webp",
    alt: "The task list, filtered by head, with columns for head, title, project, priority, status, due date and owner.",
    caption: "",
    width: 1500,
    height: 819,
    fullWidth: 2600,
    fullHeight: 1420,
  },
  {
    src: "/screens/wiki.webp",
    alt: "The internal wiki, explaining what the panel is and how to ask a department for something useful.",
    caption: "",
    width: 1500,
    height: 819,
    fullWidth: 2600,
    fullHeight: 1420,
  },
];

/**
 * When each page's content last actually changed.
 *
 * The sitemap used `new Date()`, which stamped all three URLs with the
 * build time on every deploy. Google uses lastmod only while it stays
 * consistent with reality, and a value that moves when nothing changed
 * teaches it to ignore the field. Bump the line you edited, and leave
 * the others alone.
 */
export const contentUpdated = {
  home: "2026-09-05",
  privacy: "2026-09-05",
  terms: "2026-09-05",
} as const;

export const site = {
  name: "Eterneon",
  /* Under 60 characters. */
  title: "AI business advisors for small business | Eterneon",
  /* 150 to 160 characters. */
  description:
    "Eight AI department heads for your small business: Marketing, Finance, Legal, Operations and four more, in one workspace. Bring your own API key. Free in beta.",
  appUrl: "https://business.eterneon.net",
  contactEmail: "hello@eterneon.net",
  /* The kit tagline, from the horizontal lockup. */
  tagline: "Systems for small business",
} as const;

/**
 * Open Graph for one page.
 *
 * og:url was missing everywhere. It cannot live in the root layout,
 * because a child page inherits it verbatim and then advertises the
 * home page URL while its own canonical says something else. Each page
 * passes its own path instead. The rest of the fields are the same on
 * every page, so they live here rather than being retyped three times.
 */
export const og = (path: string) => ({
  type: "website" as const,
  siteName: site.name,
  locale: "en_US",
  url: path,
});

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
