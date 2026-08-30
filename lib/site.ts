/* Everything you'd want to edit lives in this file. */

export const TIMEZONE = "America/Los_Angeles";
export const TZ_LABEL = "Pacific Time";

export const profile = {
  name: "EternalHell",
  tagline: "Founder · Eterneon Studios",
  location: "United States",
  avatar: "/pfp.png",
};

export type Social = {
  name: string;
  handle: string;
  icon: "bluesky" | "discord" | "reddit";
  href?: string;
  copy?: string;
};

export const socials: Social[] = [
  {
    name: "Bluesky",
    handle: "@eternalhell.bsky.social",
    icon: "bluesky",
    href: "https://bsky.app/profile/eternalhell.bsky.social",
  },
  {
    name: "Discord",
    handle: "eternalhellttv",
    icon: "discord",
    copy: "eternalhellttv",
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
  { name: "Pixel Artist", level: 1, icon: "grid_on" },
  { name: "Minecraft Builder", level: 4, icon: "castle" },
  { name: "Leadership", level: 2, icon: "groups" },
];

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
    icon: "grid_on",
    emptyText: "Pixel art will show up here.",
    pieces: [
      // { src: "/gallery/pixel-art/my-sprite.png", alt: "Short description", caption: "My sprite" },
    ],
  },
  {
    title: "Builds",
    icon: "castle",
    emptyText: "Interiors and exteriors will show up here.",
    pieces: [
      // { src: "/gallery/builds/my-build.png", alt: "Short description", caption: "My build" },
    ],
  },
];
