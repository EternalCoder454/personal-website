/* Everything you'd want to edit lives in this file. */

/* Vercel sets VERCEL_PROJECT_PRODUCTION_URL in production. Used for
   metadataBase, the sitemap, and robots.txt. */
/* NEXT_PUBLIC_SITE_URL wins, because VERCEL_PROJECT_PRODUCTION_URL can resolve
   to the *.vercel.app domain rather than a custom one - which would put the
   wrong host in the sitemap and every og:image. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

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

/* Either a link or a copy-to-clipboard row, never both and never neither.
   As two optional fields this compiled fine but allowed an entry with no
   href, which renders an anchor nothing can click or focus. */
export type Social =
  | (SocialBase & { href: string; copy?: never })
  | (SocialBase & { copy: string; href?: never });

export type CopySocial = Extract<Social, { copy: string }>;
export type LinkSocial = Extract<Social, { href: string }>;

/* A plain truthiness check narrows the copy branch but leaves the link branch
   as the full union, so the choice is spelled out as a predicate. */
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

/* Levels run 1-10. The band name is derived, so the number is the only
   thing to keep up to date. */
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
  email: "",
};

/* Drop an image in public/gallery/<folder>/ and add a line to pieces. */
export type Piece = { src: string; alt: string; caption: string };

export type GallerySection = {
  title: string;
  icon: string;
  emptyText: string;
  pieces: Piece[];
};

export const gallery: GallerySection[] = [
  {
    title: "Pixel Art",
    icon: "palette",
    emptyText: "Pixel art will show up here.",
    pieces: [
      // { src: "/gallery/pixel-art/my-sprite.png", alt: "Short description", caption: "My sprite" },
    ],
  },
  {
    title: "Builds",
    icon: "construction",
    emptyText: "Interiors and exteriors will show up here.",
    pieces: [
      // { src: "/gallery/builds/my-build.png", alt: "Short description", caption: "My build" },
    ],
  },
];
