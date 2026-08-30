import { hasDatabase, query } from "./db";
import { gallery as gallerySections, skills as defaultSkills, type Piece } from "./site";

export type SkillRow = {
  id: number;
  name: string;
  level: number;
  icon: string;
  position: number;
};

export type PieceRow = Piece & {
  id: number;
  section: string;
  position: number;
};

export type Section = {
  slug: string;
  title: string;
  icon: string;
  emptyText: string;
  pieces: PieceRow[];
};

/* The database is the source of truth, but the site should still render if it
   is unreachable, so every read falls back to the values in site.ts. */
async function safely<T>(read: () => Promise<T>, fallback: T, label: string): Promise<T> {
  if (!hasDatabase) return fallback;
  try {
    return await read();
  } catch (error) {
    console.error(`content: ${label} read failed, using defaults`, error);
    return fallback;
  }
}

const SECTION_SLUGS = ["pixel-art", "builds"] as const;

const fallbackSkills: SkillRow[] = defaultSkills.map((s, i) => ({
  id: -(i + 1),
  name: s.name,
  level: s.level,
  icon: s.icon,
  position: i,
}));

const fallbackSections: Section[] = gallerySections.map((section, i) => ({
  slug: SECTION_SLUGS[i] ?? String(i),
  title: section.title,
  icon: section.icon,
  emptyText: section.emptyText,
  pieces: [],
}));

/* Read per request. The panel is the only writer and traffic is tiny, so an
   indexed query beats a cache layer that can serve stale content. */
export async function getSkills(): Promise<SkillRow[]> {
  return safely(
    () =>
      query<SkillRow>(
        "select id, name, level, icon, position from skill order by position asc, id asc"
      ),
    fallbackSkills,
    "skills"
  );
}

export async function getSections(): Promise<Section[]> {
  return safely(
    async () => {
      const rows = await query<PieceRow>(
        "select id, section, src, alt, caption, position from piece order by position asc, id asc"
      );
      return fallbackSections.map((section) => ({
        ...section,
        pieces: rows.filter((row) => row.section === section.slug),
      }));
    },
    fallbackSections,
    "gallery"
  );
}
