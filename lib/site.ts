/* Everything you'd want to edit lives in this file. */

/* Vercel sets VERCEL_PROJECT_PRODUCTION_URL in production. Used for
   metadataBase, the sitemap, and robots.txt. */
/* NEXT_PUBLIC_SITE_URL wins: VERCEL_PROJECT_PRODUCTION_URL can resolve to the
   *.vercel.app domain. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/* Google Search Console and Bing Webmaster codes. Bing also covers DuckDuckGo
   and Ecosia. Blank emits no tag. */
export const verification = {
  google: "",
  bing: "",
};

export const TIMEZONE = "America/Los_Angeles";
export const TZ_LABEL = "Pacific Time";

export const profile = {
  name: "EternalHell",
  /* Shown in the top bar. The hero keeps the personal name. */
  brand: "Eterneon",
  tagline: "Founder · Eterneon Studios",
  location: "United States",
  avatar: "/pfp.png",
};

type SocialBase = {
  name: string;
  handle: string;
  icon: "bluesky" | "discord" | "reddit" | "youtube";
};

/* A link or a copy row, never both and never neither. */
export type Social =
  | (SocialBase & { href: string; copy?: never })
  | (SocialBase & { copy: string; href?: never });

export type CopySocial = Extract<Social, { copy: string }>;
export type LinkSocial = Extract<Social, { href: string }>;

/* Truthiness narrows only the copy branch, hence the predicate. */
export const isCopySocial = (social: Social): social is CopySocial =>
  social.copy !== undefined;

export const socials: Social[] = [
  {
    name: "Bluesky",
    handle: "@eternalhell.bsky.social",
    icon: "bluesky",
    href: "https://bsky.app/profile/eternalhell.bsky.social",
  },
  {
    name: "YouTube",
    handle: "@eternalhellttv",
    icon: "youtube",
    href: "https://www.youtube.com/@eternalhellttv",
  },
  {
    name: "Reddit",
    handle: "u/EternalHellTTV",
    icon: "reddit",
    href: "https://www.reddit.com/user/EternalHellTTV/",
  },
];

/* Levels run 1-10; the band name is derived. */
const BANDS = [
  { upTo: 2, name: "Beginner" },
  { upTo: 4, name: "Intermediate" },
  { upTo: 6, name: "Advanced" },
  { upTo: 8, name: "Expert" },
  { upTo: 10, name: "Master" },
];

export function bandFor(level: number) {
  return BANDS.find((b) => level <= b.upTo)?.name ?? "Beginner";
}

export type Skill = { name: string; level: number; icon: string };

export const skills: Skill[] = [
  { name: "Pixel Artist", level: 3, icon: "palette" },
  { name: "Minecraft Builder", level: 4, icon: "construction" },
  { name: "Leadership", level: 2, icon: "groups" },
  { name: "Web Designer", level: 5, icon: "web" },
];

export const contact = {
  title: "Work with me",
  /* The channel to point people at first. */
  primary: {
    label: "Join the Discord",
    href: "https://discord.gg/Xaz3QQA8fg",
    icon: "forum",
  },
  /* Add an address here to show an email button as well, e.g. "me@example.com". */
  email: "eternalhell@eterneon.net",
};

/* Drop an image in public/gallery/<slug>/ and add a line to pieces. */
export type Piece = { src: string; alt: string; caption: string };

/* One category = one page at /gallery/<slug>. Add a section here and the
   route, the index tile and the sitemap all follow. */
export type GallerySection = {
  slug: string;
  title: string;
  icon: string;
  blurb: string;
  emptyText: string;
  pieces: Piece[];
};

export const gallery: GallerySection[] = [
  {
    slug: "builds",
    title: "Builds",
    icon: "construction",
    blurb: "Minecraft interiors and exteriors.",
    emptyText: "Interiors and exteriors will show up here.",
    pieces: [
      // { src: "/gallery/builds/my-build.png", alt: "Short description", caption: "My build" },
    ],
  },
  {
    slug: "pixel-art",
    title: "Pixel Art",
    icon: "palette",
    blurb: "Sprites, tiles and icons.",
    emptyText: "Pixel art will show up here.",
    pieces: [
      // { src: "/gallery/pixel-art/my-sprite.png", alt: "Short description", caption: "My sprite" },
    ],
  },
  {
    slug: "websites",
    title: "Websites",
    icon: "web",
    blurb: "Interfaces and front-end work.",
    emptyText: "Sites and interfaces will show up here.",
    pieces: [
      // { src: "/gallery/websites/my-site.png", alt: "Short description", caption: "My site" },
    ],
  },
];

export const sectionFor = (slug: string) => gallery.find((s) => s.slug === slug);

/* Material Symbols is 362KB unsubsetted. Requesting only these drops it to 4KB.
   Content icons are derived, so adding a skill cannot leave a glyph rendering
   as its own name. Chrome icons are listed by hand - some only appear in a
   state the build never sees. */
const CHROME_ICONS = [
  "home", "photo_library", "light_mode", "dark_mode", "public", "schedule",
  "open_in_new", "mail", "content_copy", "check", "close", "explore_off", "error",
  "arrow_back", "chevron_right",
];

export const iconNames = [
  ...new Set([
    ...CHROME_ICONS,
    ...skills.map((s) => s.icon),
    ...gallery.map((g) => g.icon),
    contact.primary.icon,
  ]),
].sort();
