"use server";

import { revalidatePath } from "next/cache";
import { del, put } from "@vercel/blob";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

const SECTIONS = ["pixel-art", "builds"] as const;
type SectionSlug = (typeof SECTIONS)[number];

function refresh() {
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/panel");
}

function asSection(value: FormDataEntryValue | null): SectionSlug {
  const slug = String(value ?? "");
  if (!SECTIONS.includes(slug as SectionSlug)) throw new Error("Unknown section");
  return slug as SectionSlug;
}

function asLevel(value: FormDataEntryValue | null) {
  const level = Number(value);
  if (!Number.isInteger(level) || level < 1 || level > 10) {
    throw new Error("Level must be a whole number from 1 to 10");
  }
  return level;
}

function asText(value: FormDataEntryValue | null, field: string, max = 200) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${field} cannot be empty`);
  if (text.length > max) throw new Error(`${field} is too long`);
  return text;
}

/* ---------------- skills ---------------- */

export async function saveSkill(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const name = asText(formData.get("name"), "Name", 60);
  const icon = asText(formData.get("icon"), "Icon", 60);
  const level = asLevel(formData.get("level"));

  await query("update skill set name = $1, level = $2, icon = $3 where id = $4", [
    name,
    level,
    icon,
    id,
  ]);
  refresh();
}

export async function addSkill(formData: FormData) {
  await requireAdmin();

  const name = asText(formData.get("name"), "Name", 60);
  const icon = String(formData.get("icon") ?? "").trim() || "star";
  const level = asLevel(formData.get("level"));

  await query(
    "insert into skill (name, level, icon, position) values ($1, $2, $3, coalesce((select max(position) + 1 from skill), 0))",
    [name, level, icon]
  );
  refresh();
}

export async function deleteSkill(formData: FormData) {
  await requireAdmin();
  await query("delete from skill where id = $1", [Number(formData.get("id"))]);
  refresh();
}

export async function moveSkill(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const direction = String(formData.get("direction")) === "up" ? -1 : 1;

  const rows = await query<{ id: number }>(
    "select id from skill order by position asc, id asc"
  );
  const index = rows.findIndex((row) => row.id === id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= rows.length) return;

  [rows[index], rows[target]] = [rows[target], rows[index]];

  /* Rewrite every position so ties and gaps cannot accumulate. */
  await Promise.all(
    rows.map((row, i) => query("update skill set position = $1 where id = $2", [i, row.id]))
  );
  refresh();
}

/* ---------------- gallery ---------------- */

export async function addPiece(formData: FormData) {
  await requireAdmin();

  const section = asSection(formData.get("section"));
  const file = formData.get("file");
  const caption = asText(formData.get("caption"), "Caption", 120);
  const alt = String(formData.get("alt") ?? "").trim() || caption;

  if (!(file instanceof File) || file.size === 0) throw new Error("Pick an image first");
  if (!file.type.startsWith("image/")) throw new Error("That file is not an image");
  if (file.size > 8 * 1024 * 1024) throw new Error("Images must be under 8 MB");

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set - add Vercel Blob first");
  }

  const blob = await put(`gallery/${section}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await query(
    "insert into piece (section, src, alt, caption, position) values ($1, $2, $3, $4, coalesce((select max(position) + 1 from piece where section = $1), 0))",
    [section, blob.url, alt, caption]
  );
  refresh();
}

export async function savePiece(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const caption = asText(formData.get("caption"), "Caption", 120);
  const alt = String(formData.get("alt") ?? "").trim() || caption;

  await query("update piece set caption = $1, alt = $2 where id = $3", [caption, alt, id]);
  refresh();
}

export async function deletePiece(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const rows = await query<{ src: string }>("select src from piece where id = $1", [id]);

  await query("delete from piece where id = $1", [id]);

  /* Drop the blob too, so deleting from the panel does not quietly leave
     orphaned files being billed for. */
  const src = rows[0]?.src;
  if (src?.includes(".vercel-storage.com")) {
    try {
      await del(src);
    } catch (error) {
      console.error("blob delete failed", error);
    }
  }
  refresh();
}
