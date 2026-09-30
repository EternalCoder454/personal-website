import type { ModelChoice, Provider, PublishPack, Season, SeasonSetting, Settings, Task } from "./types";

/* Everything that is computed on the client rather than asked of the server:
   the script checks, the season and the next run. The Go program runs its own
   copy of the script checks. These are here so the page never has to trust
   that a script was checked. */

export const DISCLAIMER = "This video gives general information and is not tax advice.";
export const WORDS_MIN = 450;
export const WORDS_MAX = 750;
export const TITLE_MAX = 60;

export const TASKS: { id: Task; label: string }[] = [
  { id: "ranking", label: "Topic ranking" },
  { id: "drafts", label: "Script drafts" },
  { id: "publishPack", label: "YouTube publish pack" },
];

export const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "gemini", label: "Gemini" },
  { id: "claude", label: "Claude" },
];

/** Suggested ids per provider. The field stays free text. */
export const MODEL_OPTIONS: Record<Provider, string[]> = {
  gemini: ["gemini-flash-latest"],
  claude: ["claude-sonnet-5-5", "claude-haiku-4-5-20251001"],
};

export function defaultModel(provider: Provider): ModelChoice {
  return { provider, model: MODEL_OPTIONS[provider][0] };
}

export function providerLabel(p: Provider): string {
  return p === "gemini" ? "Gemini" : "Claude";
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ---- script checks ---- */

/** The script proper, and the model's list of numbers after the "---" line. */
export function splitScript(text: string): { body: string; notes: string } {
  const lines = text.split("\n");
  const at = lines.findIndex((l) => /^---+\s*$/.test(l.trim()));
  if (at === -1) return { body: text, notes: "" };
  return { body: lines.slice(0, at).join("\n"), notes: lines.slice(at + 1).join("\n") };
}

export type ScriptChecks = {
  words: number;
  wordsOk: boolean;
  disclaimerOk: boolean;
  /** Every line carrying NOT VERIFIED, trimmed. */
  flags: string[];
};

export function checkScript(text: string): ScriptChecks {
  const { body } = splitScript(text);
  const words = body.split(/\s+/).filter(Boolean).length;
  const tail = body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(-3);
  return {
    words,
    wordsOk: words >= WORDS_MIN && words <= WORDS_MAX,
    // The prompt puts a short ask to subscribe after the disclaimer, so the
    // line may be one of the last three.
    disclaimerOk: tail.some((l) => l.includes(DISCLAIMER)),
    flags: text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.includes("NOT VERIFIED")),
  };
}

export function checkTitle(title: string): { length: number; lengthOk: boolean; questionOk: boolean } {
  const t = title.trim();
  return { length: t.length, lengthOk: t.length > 0 && t.length < TITLE_MAX, questionOk: t.endsWith("?") };
}

export function checkPack(pack: PublishPack): {
  titles: ReturnType<typeof checkTitle>[];
  disclaimerOk: boolean;
  thumbnailOk: boolean;
} {
  return {
    titles: pack.titles.map(checkTitle),
    disclaimerOk: pack.description.includes(DISCLAIMER),
    thumbnailOk: pack.thumbnailWords.length >= 3 && pack.thumbnailWords.length <= 5,
  };
}

/* ---- season and schedule ---- */

/** In season from Jan 15 to Apr 15 unless overridden. */
export function seasonFor(date: Date, override: SeasonSetting): Season {
  if (override !== "auto") return override;
  const md = (date.getMonth() + 1) * 100 + date.getDate();
  return md >= 115 && md <= 415 ? "inseason" : "evergreen";
}

export function nextRun(now: Date, schedule: Settings["schedule"]): Date {
  const [h, m] = schedule.time.split(":").map(Number);
  const d = new Date(now);
  d.setHours(h || 0, m || 0, 0, 0);
  d.setDate(d.getDate() + ((schedule.day - d.getDay() + 7) % 7));
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 7);
  return d;
}

export function mondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ---- display ---- */

export function shortDate(iso: string): string {
  // A bare YYYY-MM-DD is read as local, not UTC, or it shows a day early.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function shortDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function longDay(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function timeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(2000, 0, 1, h || 0, m || 0).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
