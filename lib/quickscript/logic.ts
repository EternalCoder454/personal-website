import type { ModelChoice, PipelineStep, Provider, PublishPack, Role, Season, SeasonSetting, Settings, Status, Task } from "./types";

/* Everything that is computed on the client rather than asked of the server:
   the script checks, the season and the next run. The Go program runs its own
   copy of the script checks. These are here so the page never has to trust
   that a script was checked. */

export const DISCLAIMER = "This video gives general information and is not tax advice.";
export const WORDS_MIN = 450;
export const WORDS_MAX = 750;
export const TITLE_MAX = 60;

export const TASKS: { id: Task; label: string }[] = [
  { id: "ranking", label: "Ranking topics" },
  { id: "drafts", label: "Writing scripts" },
  { id: "publishPack", label: "YouTube title and description" },
];

export const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "gemini", label: "Gemini (free tier)" },
  { id: "claude", label: "Claude (best writing, paid)" },
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
  return p === "gemini" ? "Gemini (free tier)" : "Claude (best writing, paid)";
}

/** The model id as a plain name, for the log. */
export function modelName(id: string): string {
  if (/claude/i.test(id)) return providerLabel("claude");
  if (/gemini/i.test(id)) return providerLabel("gemini");
  return id;
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

/* ---- plain words ---- */

const SOURCE_NAMES: Record<string, string> = {
  ytsuggest: "YouTube suggestions",
  youtube: "YouTube search",
  trends: "Google Trends",
  irs: "IRS calendar",
  inbox: "Host question box",
  reddit: "Reddit",
};

/** Source names as the program reports them, in the words used on this page. */
export function plainSource(name: string): string {
  return name.replace("YouTube Data API", "YouTube search");
}

export function roleName(r: Role): string {
  return r === "Program" ? "QuickScript" : `the ${r}`;
}

export const cap = (t: string) => (t ? t[0].toUpperCase() + t.slice(1) : t);
const lower = (t: string) => (t ? t[0].toLowerCase() + t.slice(1) : t);
const noStop = (t: string) => t.trim().replace(/[.\s]+$/, "");
const plural = (n: number | string, one: string, many: string) => `${n} ${Number(n) === 1 ? one : many}`;

/** Why a source failed, as a fragment that follows "failed:". */
export function plainReason(raw: string): string {
  const retry = "It will try again at the next run.";
  if (/\b(quota|rate limit|limit|too many requests|429)\b/i.test(raw)) {
    return `${/\bdaily\b/i.test(raw) ? "daily limit" : "limit"} reached. ${retry}`;
  }
  if (/\b(time.?out|timed out|deadline exceeded)\b/i.test(raw)) return `it took too long to answer. ${retry}`;
  if (/\b(401|403)\b|\bforbidden\b|\bunauthori[sz]ed\b|\bapi key\b/i.test(raw)) {
    return "the key was refused. Ask whoever runs the server to check it.";
  }
  return noStop(raw) ? `${lower(noStop(raw))}. ${retry}` : `no reason was given. ${retry}`;
}

const who = (to: string | undefined) => (to === "host" ? "the Host" : to === "me" ? "you, as a test" : (to ?? "someone"));

/** A known event as a sentence, or null when it is unknown or lacks a key it needs. */
function describe(rest: string, kv: Record<string, string>): string | null {
  const w = rest.split(/\s+/);
  if (w[0] === "weekly" && w[1] === "start") {
    const to = kv.to ? ` to ${who(kv.to)}` : "";
    return kv.dry_run === "true" ? `Practice run started. Nothing is sent. It would go${to || " nowhere"}` : `Weekly run started${kv.to ? `, sending${to}` : ""}`;
  }
  if (w[0] === "weekly" && w[1] === "done") return "Weekly run finished";
  if (w[0] === "topics" && w[1] === "start") return "Started looking for topics";
  if (w[0] === "collect" && w[1] === "done") {
    if (!kv.sources || !kv.topics || !kv.kept) return null;
    return `Looked at ${plural(kv.sources, "source", "sources")}: ${plural(kv.topics, "topic", "topics")} found, kept the best ${kv.kept}`;
  }
  if (w[0] === "collect" && w[1]) {
    const name = SOURCE_NAMES[w[1]] ?? w[1];
    if (w[2] === "ok" && kv.topics) return `${name}: ${plural(kv.topics, "topic", "topics")} found`;
    if (w[2] === "failed" && kv.err?.trim()) return `${name} failed: ${plainReason(kv.err)}`;
    if (w[2] === "cached") {
      const d = /^(\d+)d$/.exec(kv.age ?? "");
      return `${name}: used the saved copy${d ? ` from ${plural(d[1], "day", "days")} ago` : ""}`;
    }
    if (w[2] === "off") return `${name}: turned off`;
    return null;
  }
  if (w[0] === "rank") {
    const parts = [kv.kept ? `Ranked the topics and kept the best ${kv.kept}` : "Ranked the topics"];
    if (kv.deadline_boost) parts.push(`${plural(kv.deadline_boost, "topic", "topics")} moved up because a deadline is soon`);
    if (kv.high_end_demoted) parts.push(`${plural(kv.high_end_demoted, "topic", "topics")} moved down as too specialised`);
    return parts.join(". ");
  }
  if (w[0] === "draft" && kv.top) {
    return `Wrote ${plural(kv.top, "script", "scripts")}${kv.model ? ` with ${modelName(kv.model)}` : ""}`;
  }
  if (w[0] === "mail" && kv.sent) return `Emailed ${plural(kv.sent, "script", "scripts")}${kv.to ? ` to ${who(kv.to)}` : ""}`;
  return null;
}

/** One log line as a sentence. A line that is not in the program's format is already plain and passes through. */
export function plainLogLine(line: string): string {
  try {
    const m = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}\s+([A-Z]+)\s+(.*)$/.exec(line.trim());
    if (!m) return line;
    const [, level, rest] = m;
    const kv: Record<string, string> = {};
    for (const x of rest.matchAll(/(\w+)=(?:"([^"]*)"|(\S+))/g)) kv[x[1]] = x[2] ?? x[3];
    const text = describe(rest, kv) ?? cap(rest);
    return level === "INFO" ? text : `Problem: ${lower(text)}`;
  } catch {
    return line;
  }
}

/** How strong a topic is. The number stays next to it. */
export function strength(score: number): "Strong" | "Good" | "Weak" {
  return score >= 80 ? "Strong" : score >= 60 ? "Good" : "Weak";
}

/* ---- where a script is in its life ---- */

export const STATUS_INFO: Record<Status, { label: string; waiting: string }> = {
  Draft: { label: "Draft", waiting: "Waiting for the Host to approve it" },
  Approved: { label: "Approved", waiting: "Waiting for the Host to record the video" },
  Recorded: { label: "Recorded", waiting: "Waiting for the Producer to edit the video" },
  Edited: { label: "Edited", waiting: "Waiting for the Producer to schedule the upload" },
  Scheduled: { label: "Scheduled on YouTube", waiting: "Waiting for the Clipper to cut clips" },
  Clipped: { label: "Clips made", waiting: "Waiting for the Clipper to use them in Meta Ads" },
  "In Meta Ads": { label: "Running in Meta Ads", waiting: "Nothing left to do" },
};

/* ---- what to do now ---- */

export type NextStep =
  | { kind: "find"; text: string; button: string }
  | { kind: "draft"; text: string; button: string; count: number }
  | { kind: "send"; text: string; button: string; /** Scripts the send will email, when known. */ total: number | null; alreadySent: number }
  | { kind: "wait"; text: string }
  | { kind: "done"; text: string };

const doneOf = (s: PipelineStep | undefined, total: number | null): number => {
  if (!s) return 0;
  const m = /^(\d+) of (\d+)/.exec(s.detail ?? "");
  if (m) return Number(m[1]);
  return s.state === "done" && total !== null ? total : 0;
};

/** Works out the one thing to do next from the pipeline. */
export function nextStep(steps: PipelineStep[], season: Season): NextStep {
  const by = (k: PipelineStep["key"]) => steps.find((s) => s.key === k);
  const topics = by("topics");
  if (!topics || topics.state === "todo") {
    return { kind: "find", text: "No topics yet this week. Start by finding what people are asking about taxes.", button: "Find this week's topics" };
  }
  const drafts = by("drafts");
  const dm = /of (\d+)/.exec(drafts?.detail ?? "");
  // null: scripts exist but the count could not be read, so never offer to write more.
  const total: number | null = !drafts || drafts.state === "todo" ? 0 : dm ? Number(dm[1]) : null;
  if (total === 0) {
    const count = season === "inseason" ? 1 : 3;
    return {
      kind: "draft",
      text: `Topics are ready. Next, have QuickScript write ${plural(count, "script", "scripts")} for the best ones.`,
      button: `Write ${plural(count, "script", "scripts")}`,
      count,
    };
  }
  const sent = by("sent");
  if (!sent || sent.state !== "done") {
    const already = doneOf(sent, total);
    // sendDrafts emails every draft of the week, so a second send repeats the ones that already went.
    if (total !== null && already > 0) {
      return {
        kind: "send",
        text: `${plural(total, "script is", "scripts are")} written and ${already} already went to the Host. Sending again emails all ${total}.`,
        button: `Send all ${total} to the Host`,
        total,
        alreadySent: already,
      };
    }
    return {
      kind: "send",
      text: total === null ? "The scripts are written. Next, email them to the Host to read." : `${plural(total, "script is", "scripts are")} written. Next, email ${total === 1 ? "it" : "them"} to the Host to read.`,
      button: total === 1 ? "Send the script to the Host" : "Send the scripts to the Host",
      total,
      alreadySent: 0,
    };
  }
  const later: { key: PipelineStep["key"]; lead: string; one: string; many: string }[] = [
    { key: "approved", lead: "Waiting for the Host to approve", one: "script", many: "scripts" },
    { key: "recorded", lead: "Waiting for the Host to record", one: "video", many: "videos" },
    { key: "edited", lead: "Waiting for the Producer to edit", one: "video", many: "videos" },
    { key: "scheduled", lead: "Waiting for the Producer to schedule", one: "upload", many: "uploads" },
    { key: "clipped", lead: "Waiting for the Clipper to cut clips for", one: "video", many: "videos" },
  ];
  for (const l of later) {
    const st = by(l.key);
    if (total === null) {
      if (!st || st.state !== "done") return { kind: "wait", text: `${l.lead} the ${l.many}` };
      continue;
    }
    const left = total - doneOf(st, total);
    if (left > 0) return { kind: "wait", text: `${l.lead} ${plural(left, l.one, l.many)}` };
  }
  return { kind: "done", text: "All done for this week" };
}
