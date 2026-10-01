import type { AutomaticSettings, HeldScript, KeyStatus, LastRun, ModelChoice, PipelineStep, Provider, PublishPack, Role, Season, SeasonSetting, Settings, Status, Task } from "./types";

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
  claude: ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-4-5"],
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

/**
 * The tax year scripts are written for: the override when set, otherwise the
 * return people are filing (last year) from Jan 1 through Apr 15, and the one
 * they are planning for (this year) after. Same rule as Settings.TaxYearAt in Go.
 */
export function taxYearFor(date: Date, override: number): number {
  if (override) return override;
  const md = (date.getMonth() + 1) * 100 + date.getDate();
  return md <= 415 ? date.getFullYear() - 1 : date.getFullYear();
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

const dayMonth = (d: Date) =>
  `${d.toLocaleDateString("en-US", { weekday: "short" })} ${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })}`;

/** A bare YYYY-MM-DD is read as local, not UTC, or it shows a day early. */
const parseWhen = (iso: string | Date): Date => (typeof iso === "string" ? (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso)) : iso);

/** "Sun 27 Sep" */
export function shortDate(iso: string): string {
  return dayMonth(parseWhen(iso));
}

/** "Sun 27 Sep, 8:00 PM" */
export function shortDateTime(iso: string | Date): string {
  const d = parseWhen(iso);
  return `${dayMonth(d)}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

/** "Sun 4 Oct" */
export function longDay(d: Date): string {
  return dayMonth(d);
}

/**
 * Every time on the page goes through here: "3 days ago · Sun 27 Sep, 8:00 PM".
 * Older than 4 weeks it is the date alone. A bare date has no time of day.
 */
export function whenLabel(iso: string | Date, now: Date = new Date()): string {
  const d = parseWhen(iso);
  const bare = typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const abs = bare ? dayMonth(d) : shortDateTime(d);
  const mins = Math.round((now.getTime() - d.getTime()) / 60_000);
  if (mins < 0 || mins > 28 * 1440) return abs;
  let rel: string;
  if (bare) {
    const days = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - d.getTime()) / 86_400_000);
    rel = days <= 0 ? "today" : days === 1 ? "yesterday" : days < 14 ? `${days} days ago` : `${Math.floor(days / 7)} weeks ago`;
  } else if (mins < 1) rel = "just now";
  else if (mins < 60) rel = plural(mins, "minute", "minutes") + " ago";
  else if (mins < 1440) rel = plural(Math.floor(mins / 60), "hour", "hours") + " ago";
  else if (mins < 2880) rel = "yesterday";
  else if (mins < 14 * 1440) rel = `${Math.floor(mins / 1440)} days ago`;
  else rel = `${Math.floor(mins / 10080)} weeks ago`;
  return `${rel} · ${abs}`;
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

/** A role as a label: the program is called QuickScript. */
export const roleLabel = (r: Role): string => (r === "Program" ? "QuickScript" : r);

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
    return kv.dry_run === "true" ? `Test run started. Nothing is sent. It would go${to || " nowhere"}` : `Weekly run started${kv.to ? `, sending${to}` : ""}`;
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
    const named = Object.values(SOURCE_NAMES).some((n) => text.startsWith(n));
    return level === "INFO" ? text : `Problem: ${named ? text : lower(text)}`;
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


/* ---- the automatic run ---- */

/** How the strongest scripts are chosen, in plain words. Settings and the Guide show the steps, and every run returns them joined as `rule`. */
export const HOW_CHOSEN_STEPS = [
  "Rank the topics by score.",
  "Write scripts for the top ones, a few more than will be sent.",
  "Keep only the scripts that pass every check (when that option is on) and whose topic is strong enough.",
  "Put the highest scores first and email up to the number set here (1 in tax season).",
  "Every other script is not sent, and it says why.",
];
export const HOW_CHOSEN = HOW_CHOSEN_STEPS.join(" ");

/** Scripts written per run: the number to send and two spare, never more than 5. */
export function scriptsToWrite(sendMax: number): number {
  return Math.min(5, sendMax + 2);
}

/** The most scripts one run sends: the setting, or 1 in season. */
export function sendLimit(auto: AutomaticSettings, season: Season): number {
  return season === "inseason" ? 1 : Math.min(5, Math.max(1, Math.round(auto.maxScripts) || 1));
}

export const MIN_STRENGTH_LABEL: Record<AutomaticSettings["minStrength"], string> = {
  strong: "Strong only",
  good: "Strong and Good",
};

/** Why a script would be held back for its checks, as plain fragments. Empty when it passes. */
export function checkProblems(text: string): string[] {
  const c = checkScript(text);
  const out: string[] = [];
  if (!c.wordsOk) out.push(`length is ${c.words} words, it needs ${WORDS_MIN} to ${WORDS_MAX}`);
  if (!c.disclaimerOk) out.push("disclaimer is missing");
  if (c.flags.length > 0) out.push(`${plural(c.flags.length, "number needs", "numbers need")} checking`);
  return out;
}

/**
 * The rule. Takes this run's scripts and says which go out, highest score first,
 * and which are held back and why. The Go program applies the same rule.
 */
export function chooseToSend<T extends { slug: string; score: number; text: string }>(
  items: T[],
  auto: AutomaticSettings,
  limit: number,
): { send: T[]; held: { item: T; reasons: string[] }[] } {
  const ranked = [...items].sort((a, b) => b.score - a.score);
  const send: T[] = [];
  const held: { item: T; reasons: string[] }[] = [];
  for (const item of ranked) {
    const reasons: string[] = [];
    const s = strength(item.score);
    if (s === "Weak" || (auto.minStrength === "strong" && s !== "Strong")) {
      reasons.push(`topic strength is ${s}, ${auto.minStrength === "strong" ? "only Strong is sent" : "Strong or Good is needed"}`);
    }
    if (auto.onlyIfChecksPass) reasons.push(...checkProblems(item.text));
    if (reasons.length === 0 && send.length >= limit) reasons.push(`over the limit of ${limit} for one run`);
    if (reasons.length === 0) send.push(item);
    else held.push({ item, reasons });
  }
  return { send, held };
}

/** "Not sent, needs a fix: 2 numbers need checking" */
export function heldLine(h: Pick<HeldScript, "reasons">): string {
  return `Not sent, needs a fix: ${h.reasons.join(", ")}`;
}

/** "Sun 4 Oct, 8:00 PM" */
export function nextRunLabel(d: Date): string {
  return `${dayMonth(d)}, ${timeLabel(`${d.getHours()}:${d.getMinutes()}`)}`;
}

/** The most recent scheduled time at or before now. */
export function lastScheduled(now: Date, schedule: Settings["schedule"]): Date {
  const next = nextRun(now, schedule);
  next.setDate(next.getDate() - 7);
  return next;
}

const KEY_FOR: Record<Provider, keyof KeyStatus> = { gemini: "GEMINI_API_KEY", claude: "ANTHROPIC_API_KEY" };

/** Labels of the providers the settings use whose key is not set on the server. */
export function missingProviders(settings: Settings, keys: KeyStatus | undefined): string[] {
  if (!keys) return [];
  const used = new Set<Provider>(TASKS.map((t) => settings.models[t.id].provider));
  return [...used].filter((p) => !keys[KEY_FOR[p]]).map(providerLabel);
}

export type AutoState = "good" | "attention" | "failed" | "missed";
export type AutoStatus = { state: AutoState; title: string; text: string; plan: string };

const STATE_TITLE: Record<AutoState, string> = { good: "All good", attention: "Needs attention", failed: "Failed", missed: "Didn't run" };

/** The status card: what needs a person first, else the plain plan. The plan line is always there. */
export function autoStatus(settings: Settings, keys: KeyStatus | undefined, lastRun: LastRun | undefined, now: Date): AutoStatus {
  const a = settings.automatic;
  const limit = sendLimit(a, seasonFor(now, settings.seasonOverride));
  const to = a.sendTo.trim();
  const next = nextRunLabel(nextRun(now, settings.schedule));
  const plan = !to
    ? `Next run ${next} · no address to send to`
    : !a.enabled
      ? `Next run ${next} · nothing is sent while automatic sending is off`
      : `Next run ${next} · sends up to ${limit} to ${to}`;
  const mk = (state: AutoState, text: string): AutoStatus => ({ state, title: STATE_TITLE[state], text, plan });
  if (!to) return mk("attention", "No send-to address is set. Add the Host's email in Settings, or nothing can be emailed.");
  if (!a.enabled) return mk("attention", "Automatic sending is off. Turn it on in Settings, or scripts wait until somebody sends them.");
  const keyGone = missingProviders(settings, keys);
  if (keyGone.length > 0) {
    return mk("attention", `An API key is missing: ${keyGone.join(", ")}. Whoever runs the server must set it, and the next run will not work until they do.`);
  }
  if (lastRun && !lastRun.ok) {
    return mk(
      "failed",
      `The last run failed${lastRun.error ? `: ${noStop(lastRun.error)}` : ""}. Press Make scripts and email the Host below. If it fails again, see Help.`,
    );
  }
  if (!lastRun) {
    return mk("good", `Automatic sending is on. Nothing has run yet; the first run is ${next}.`);
  }
  // A run takes a while, so a run is only called missed once its scheduled
  // time is well past. Inside that window the previous week's is checked.
  const GRACE = 45 * 60_000;
  let due = lastScheduled(now, settings.schedule);
  if (now.getTime() - due.getTime() < GRACE) due = new Date(due.getTime() - 7 * 86_400_000);
  if (new Date(lastRun.ranAt).getTime() < due.getTime() - 5 * 60_000) {
    return mk("missed", `Nothing ran at the last scheduled time, ${nextRunLabel(due)}. Press Make scripts and email the Host below. If it keeps happening, tell whoever runs the server.`);
  }
  // Go sends an empty list as null, so never assume the arrays are there.
  const held = lastRun.held ?? [];
  const sent = lastRun.sent ?? [];
  if (held.length > 0) {
    return mk(
      "attention",
      `${plural(held.length, "script was", "scripts were")} not sent and need${held.length === 1 ? "s" : ""} a fix. The list below says why. Open it on the Scripts tab, fix it, then send it to the Host.`,
    );
  }
  if (sent.length === 0) {
    return mk("attention", "The last run found nothing strong enough to send. Open More details below to see this week's topics, or allow Good topics under Settings, More options.");
  }
  return mk("good", `Automatic sending is on. The last run sent ${plural(sent.length, "script", "scripts")} to ${lastRun.sentTo || to}.`);
}
