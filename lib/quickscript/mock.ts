import type { QuickScriptClient } from "./client";
import {
  DISCLAIMER,
  defaultModel,
  isoDate,
  mondayOf,
  providerLabel,
  seasonFor,
  slugify,
} from "./logic";
import {
  STATUSES,
  type CollectorStatus,
  type PipelineStep,
  type PostingRow,
  type PublishPack,
  type RankedTopic,
  type Recipient,
  type Script,
  type Settings,
  type Status,
  type WeekState,
} from "./types";

/* In-memory sample data. Nothing here is tax guidance: the scripts are
   placeholder prose, and the one figure in them is a marked placeholder that
   the checks are meant to flag. */

const DELAY_MS = 450;
const wait = () => new Promise<void>((r) => setTimeout(r, DELAY_MS));

const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();
const daysAgo = (n: number) => isoDate(new Date(Date.now() - n * 86_400_000));

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${isoDate(d)} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
const line = (level: "INFO" | "WARN", msg: string) => `${stamp()} ${level} ${msg}`;

/* ---- sample scripts ---- */

const FILLER = [
  "This is placeholder text that stands in for a real script.",
  "Nothing in this sample is tax guidance, and none of it should be recorded.",
  "A real draft would answer the question in plain words within the first thirty seconds.",
  "It would then walk through one short example in everyday terms.",
  "The wording here only exists so the word count and the other checks have something to read.",
  "A real script would name the tax year near the start and keep each sentence short.",
  "It would avoid jargon, or explain a term the first time it appears.",
  "The host would check every number against the IRS page before recording.",
];

function sampleBody(topic: string, target: number, extra: string[] = []): string {
  const paras: string[] = [`SAMPLE SCRIPT. ${topic}`];
  let words = paras[0].split(/\s+/).length;
  let i = 0;
  while (words < target) {
    const para: string[] = [];
    for (let k = 0; k < 4 && words < target; k++) {
      const s = FILLER[i++ % FILLER.length];
      para.push(s);
      words += s.split(/\s+/).length;
    }
    paras.push(para.join(" "));
    if (paras.length === 3) {
      for (const e of extra) {
        paras.push(e);
        words += e.split(/\s+/).length;
      }
    }
  }
  paras.push(DISCLAIMER);
  paras.push("Subscribe for more plain answers to everyday tax questions.");
  return paras.join("\n\n");
}

function withNotes(body: string, notes: string[]): string {
  return `${body}\n\n---\nNumbers and rules used\n${notes.map((n) => `- ${n}`).join("\n")}`;
}

function makeScript(
  topic: string,
  status: Status,
  sentTo: Recipient | undefined,
  model: Script["model"],
  body: string,
  notes: string[],
  minsAgo: number,
): Script {
  const slug = slugify(topic);
  return {
    slug,
    topic,
    taxYear: 2026,
    status,
    sentTo,
    sources: ["https://www.irs.gov/ (sample link, no page fetched)"],
    model,
    createdAt: minutesAgo(minsAgo),
    text: withNotes(body, notes),
  };
}

/* ---- sample topics ---- */

type Seed = { q: string; sources: string[]; score: number; deadline?: boolean; highEnd?: boolean };

const SEEDS: Seed[] = [
  { q: "Can I deduct my home office?", sources: ["YouTube suggestions", "Google Trends"], score: 91.4 },
  { q: "Do I need to make estimated tax payments?", sources: ["YouTube suggestions", "Host question box"], score: 86.2, deadline: true },
  { q: "What should I do when I get an IRS notice?", sources: ["Google Trends", "YouTube Data API"], score: 82.7 },
  { q: "How do I file a tax extension?", sources: ["IRS calendar", "Google Trends"], score: 79.9, deadline: true },
  { q: "What is the difference between a W-2 and a 1099?", sources: ["YouTube suggestions"], score: 74.3 },
  { q: "Can I deduct mileage for gig work?", sources: ["YouTube suggestions", "Host question box"], score: 71.8 },
  { q: "How is side hustle income taxed?", sources: ["Google Trends"], score: 68.5 },
  { q: "Why is my tax refund late?", sources: ["YouTube Data API"], score: 61.0 },
  { q: "Do I need a trust to protect my rental property?", sources: ["Google Trends"], score: 44.6, highEnd: true },
  { q: "Is there gift tax when I help my kids with a house?", sources: ["YouTube suggestions"], score: 39.2, highEnd: true },
];

function seenAt(i: number): string {
  return minutesAgo(3000 + i * 7);
}

/* ---- state ---- */

type State = {
  settings: Settings;
  scripts: Script[];
  topicIds: string[];
  collectors: CollectorStatus[];
  log: string[];
  driveReady: boolean;
  older: PostingRow[];
};

function initialSettings(): Settings {
  return {
    models: {
      ranking: { provider: "gemini", model: "gemini-flash-latest" },
      drafts: { provider: "claude", model: "claude-sonnet-5-5" },
      publishPack: { provider: "gemini", model: "gemini-flash-latest" },
    },
    seedWords: [
      "tax deduction",
      "estimated taxes",
      "IRS notice",
      "1099",
      "W-2",
      "tax extension",
      "tax refund",
      "audit",
      "self-employed",
      "home office",
      "side hustle taxes",
      "gig work",
      "mileage",
      "tax withholding",
    ],
    highEndWords: ["trust", "estate", "gift tax"],
    sources: [
      { id: "ytsuggest", name: "YouTube suggestions", enabled: true },
      { id: "youtube", name: "YouTube Data API", enabled: true },
      { id: "trends", name: "Google Trends", enabled: true },
      { id: "irs", name: "IRS calendar", enabled: true },
      { id: "inbox", name: "Host question box", enabled: true },
      {
        id: "reddit",
        name: "Reddit",
        enabled: false,
        reason: "Needs Reddit approval since Nov 2025",
      },
    ],
    people: {
      hostEmail: "host@example.com",
      testRecipient: "me@example.com",
      clipperEmail: "clipper@example.com",
    },
    schedule: { day: 0, time: "20:00" },
    seasonOverride: "auto",
    taxYear: 2026,
  };
}

function initialState(): State {
  const claude = { provider: "claude" as const, model: "claude-sonnet-5-5" };
  const s1 = makeScript(
    SEEDS[0].q,
    "Approved",
    "host",
    claude,
    sampleBody(SEEDS[0].q, 520),
    ["Tax year 2026: supported by sample IRS text"],
    3000,
  );
  const s2 = makeScript(
    SEEDS[1].q,
    "Draft",
    "host",
    claude,
    sampleBody(SEEDS[1].q, 540, ["For this sample, the figure is 1,234 dollars, written only to show the check."]),
    ["Tax year 2026: supported by sample IRS text", "1,234 dollars (placeholder figure): NOT VERIFIED"],
    3000,
  );
  const s3 = makeScript(
    SEEDS[2].q,
    "Draft",
    undefined,
    { provider: "gemini", model: "gemini-flash-latest" },
    sampleBody(SEEDS[2].q, 300).replace(`\n\n${DISCLAIMER}`, ""),
    ["Tax year 2026: supported by sample IRS text"],
    3000,
  );
  const run = new Date(mondayOf(new Date()).getTime() - 4 * 3_600_000);
  const at = (sec: number) => {
    const d = new Date(run.getTime() + sec * 1000);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${isoDate(d)} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };
  return {
    settings: initialSettings(),
    scripts: [s1, s2, s3],
    topicIds: SEEDS.map((s) => slugify(s.q)),
    collectors: [
      { id: "ytsuggest", name: "YouTube suggestions", state: "ok", lastRun: run.toISOString() },
      { id: "youtube", name: "YouTube Data API", state: "failed", lastRun: run.toISOString(), note: "Daily quota used" },
      { id: "trends", name: "Google Trends", state: "cached", lastRun: run.toISOString(), note: "Cache from 2 days ago" },
      { id: "irs", name: "IRS calendar", state: "ok", lastRun: run.toISOString() },
      { id: "inbox", name: "Host question box", state: "ok", lastRun: run.toISOString() },
      { id: "reddit", name: "Reddit", state: "off", note: "Needs Reddit approval since Nov 2025" },
    ],
    log: [
      `${at(0)} INFO weekly start dry_run=false to=host`,
      `${at(2)} INFO collect ytsuggest ok topics=28`,
      `${at(9)} WARN collect youtube failed err="daily quota used"`,
      `${at(11)} INFO collect trends cached age=2d`,
      `${at(12)} INFO collect irs ok topics=3`,
      `${at(12)} INFO collect inbox ok topics=2`,
      `${at(14)} INFO rank kept=10 deadline_boost=2 high_end_demoted=2`,
      `${at(40)} INFO draft top=3 model=claude-sonnet-5-5`,
      `${at(95)} INFO mail sent=2 to=host`,
      `${at(96)} INFO weekly done`,
    ],
    driveReady: false,
    older: [
      older("What is a 1099-NEC?", "Scheduled", { Draft: 16, Approved: 14, Recorded: 12, Edited: 10, Scheduled: 9 }),
      older("Can I write off my phone bill?", "In Meta Ads", { Draft: 23, Approved: 21, Recorded: 19, Edited: 17, Scheduled: 16, Clipped: 14, "In Meta Ads": 12 }),
      older("Do I have to report cash tips?", "Clipped", { Draft: 23, Approved: 21, Recorded: 19, Edited: 17, Scheduled: 16, Clipped: 13 }),
      older("How long should I keep tax records?", "Edited", { Draft: 16, Approved: 14, Recorded: 12, Edited: 10 }),
    ],
  };
}

function older(topic: string, status: Status, ago: Partial<Record<Status, number>>): PostingRow {
  const dates: PostingRow["dates"] = {};
  for (const st of STATUSES) {
    const n = ago[st];
    if (n !== undefined) dates[st] = daysAgo(n);
  }
  const slug = slugify(topic);
  return { slug, topic, status, dates, docUrl: `https://docs.google.com/document/d/sample-${slug}` };
}

const state: State = initialState();
const copy = <T>(v: T): T => structuredClone(v);

/* ---- derived views ---- */

function topicsView(): RankedTopic[] {
  const drafted = new Set(state.scripts.map((s) => s.slug));
  return SEEDS.map((s, i): RankedTopic => {
    const id = slugify(s.q);
    return {
      id,
      question: s.q,
      source: s.sources[0],
      sources: s.sources,
      score: s.score,
      seenAt: seenAt(i),
      deadlineBoost: !!s.deadline,
      highEndDemoted: !!s.highEnd,
      drafted: drafted.has(id),
    };
  }).filter((t) => state.topicIds.includes(t.id));
}

function steps(): PipelineStep[] {
  const total = state.scripts.length;
  const rank = (s: Script) => STATUSES.indexOf(s.status);
  const count = (pred: (s: Script) => boolean) => state.scripts.filter(pred).length;
  const of = (key: PipelineStep["key"], label: string, who: PipelineStep["who"], n: number): PipelineStep => ({
    key,
    label,
    who,
    state: total > 0 && n === total ? "done" : n > 0 ? "partial" : "todo",
    detail: total > 0 && n > 0 ? `${n} of ${total}` : undefined,
  });
  return [
    { key: "topics", label: "Topics", who: "Program", state: state.topicIds.length ? "done" : "todo" },
    of("drafts", "Drafts", "Program", total),
    of("sent", "Sent to Host", "Program", count((s) => s.sentTo === "host")),
    of("approved", "Approved", "Host", count((s) => rank(s) >= 1)),
    of("recorded", "Recorded", "Host", count((s) => rank(s) >= 2)),
    of("edited", "Edited", "Producer", count((s) => rank(s) >= 3)),
    of("scheduled", "Scheduled", "Producer", count((s) => rank(s) >= 4)),
    of("clipped", "Clipped", "Clipper", count((s) => rank(s) >= 5)),
  ];
}

function collectorsView(): CollectorStatus[] {
  return state.collectors.map((c) => {
    const src = state.settings.sources.find((s) => s.id === c.id);
    if (src && !src.enabled) return { ...c, state: "off", note: src.reason ?? "Turned off in Settings" };
    if (src?.enabled && c.state === "off") return { ...c, state: "ok" as const, note: undefined };
    return c;
  });
}

function postingRows(): PostingRow[] {
  const mine = state.scripts.map((s): PostingRow => {
    const dates: PostingRow["dates"] = { Draft: isoDate(new Date(s.createdAt)) };
    const r = STATUSES.indexOf(s.status);
    if (r >= 1) dates.Approved = daysAgo(1);
    return { slug: s.slug, topic: s.topic, status: s.status, dates, docUrl: `https://docs.google.com/document/d/sample-${s.slug}` };
  });
  return [...mine, ...state.older];
}

/* ---- actions ---- */

function recipientLine(n: number, to: Recipient): string {
  const who = to === "host" ? `Host (${state.settings.people.hostEmail})` : `you (${state.settings.people.testRecipient})`;
  return `Sent ${n} ${n === 1 ? "draft" : "drafts"} to ${who}`;
}

function doFind(): string {
  const at = new Date().toISOString();
  state.collectors = state.collectors.map((c) =>
    c.state === "off" ? c : { ...c, state: c.state === "cached" ? "cached" : "ok", lastRun: at, note: c.state === "cached" ? c.note : undefined },
  );
  const l = "collect done sources=5 topics=41 kept=10";
  state.log = [line("INFO", "topics start"), line("INFO", l), line("INFO", "rank deadline_boost=2 high_end_demoted=2")];
  return "Found 41 topics, kept the 10 best";
}

function doDraft(ids: string[]): string {
  const fresh = ids.filter((id) => !state.scripts.some((s) => s.slug === id));
  const skipped = ids.length - fresh.length;
  for (const id of fresh) {
    const seed = SEEDS.find((s) => slugify(s.q) === id);
    if (!seed) continue;
    const model = state.settings.models.drafts;
    state.scripts.push(
      makeScript(seed.q, "Draft", undefined, model, sampleBody(seed.q, 560), [`Tax year ${state.settings.taxYear}: supported by sample IRS text`], 0),
    );
  }
  const msg = fresh.length
    ? `Drafted ${fresh.length} ${fresh.length === 1 ? "script" : "scripts"} with ${state.settings.models.drafts.model}` +
      (skipped ? `, ${skipped} already drafted` : "")
    : "Nothing new to draft, all chosen topics already have a script";
  state.log = [...state.log, line("INFO", `draft ${msg.toLowerCase()}`)];
  return msg;
}

function topRank(n: number): string[] {
  return topicsView()
    .filter((t) => !t.drafted)
    .slice(0, n)
    .map((t) => t.id);
}

export const mockClient: QuickScriptClient = {
  async getWeek(): Promise<WeekState> {
    await wait();
    return copy({
      weekOf: isoDate(mondayOf(new Date())),
      steps: steps(),
      topics: topicsView(),
      collectors: collectorsView(),
      driveReady: state.driveReady,
      log: state.log,
    });
  },

  async runWeekly({ dryRun, to }) {
    await wait();
    const n = seasonFor(new Date(), state.settings.seasonOverride) === "inseason" ? 1 : 3;
    if (dryRun) {
      const l = `Dry run: would find topics, draft ${n}, and send to ${to === "host" ? "the Host" : "you"}. Nothing written.`;
      state.log = [line("INFO", `weekly start dry_run=true to=${to}`), line("INFO", l)];
      return { log: l };
    }
    doFind();
    const d = doDraft(topRank(n));
    const sent = state.scripts.filter((s) => s.status === "Draft" && !s.sentTo);
    sent.forEach((s) => (s.sentTo = to));
    state.log.push(line("INFO", `mail ${recipientLine(sent.length, to).toLowerCase()}`));
    return { log: `Weekly run finished. ${d}. ${recipientLine(sent.length, to)}` };
  },

  async findTopics() {
    await wait();
    return { log: doFind() };
  },

  async draft(req) {
    await wait();
    const ids = "count" in req ? topRank(req.count) : req.topicIds;
    return { log: doDraft(ids) };
  },

  async sendDrafts({ to }) {
    await wait();
    const drafts = state.scripts.filter((s) => s.status === "Draft");
    if (!drafts.length) throw new Error("No drafts to send this week");
    drafts.forEach((s) => (s.sentTo = to));
    const msg = recipientLine(drafts.length, to);
    state.log = [...state.log, line("INFO", `mail ${msg.toLowerCase()}`)];
    return { log: msg };
  },

  async setupDrive() {
    await wait();
    if (state.driveReady) return { log: "Drive was already set up" };
    state.driveReady = true;
    const msg = "Created QuickScript folder, five subfolders and the Posting Log, shared with Host and Clipper";
    state.log = [...state.log, line("INFO", `drive ${msg.toLowerCase()}`)];
    return { log: msg };
  },

  async listScripts() {
    await wait();
    return copy(state.scripts);
  },

  async sendScript(slug, to) {
    await wait();
    const s = state.scripts.find((x) => x.slug === slug);
    if (!s) throw new Error("Script not found");
    s.sentTo = to;
    return { log: recipientLine(1, to) };
  },

  async redraft(slug, { provider, model }) {
    await wait();
    const i = state.scripts.findIndex((x) => x.slug === slug);
    if (i === -1) throw new Error("Script not found");
    const old = state.scripts[i];
    if (old.status !== "Draft") throw new Error("Only a draft can be redrafted");
    const mc = model.trim() ? { provider, model: model.trim() } : defaultModel(provider);
    state.scripts[i] = {
      ...makeScript(old.topic, "Draft", undefined, mc, sampleBody(old.topic, 600), ["Tax year 2026: supported by sample IRS text"], 0),
      slug: old.slug,
    };
    return { log: `Redrafted with ${providerLabel(provider)} (${mc.model}), no flagged numbers` };
  },

  async makePack(slug) {
    await wait();
    const s = state.scripts.find((x) => x.slug === slug);
    if (!s) throw new Error("Script not found");
    if (s.status === "Draft") throw new Error("Only an approved script can have a publish pack");
    const pack: PublishPack = {
      titles: [s.topic, `${s.topic.replace(/\?$/, "")} in ${s.taxYear}?`, `Quick answer: ${s.topic}`],
      description: [
        "Sample description, first line answers the question.",
        "Sample description, second line adds one detail.",
        "",
        `Source: ${s.sources[0]}`,
        "",
        `${DISCLAIMER} Talk to a qualified tax professional about your own situation.`,
      ].join("\n"),
      playlist: "Deductions",
      thumbnailWords: ["HOME", "OFFICE", "SAMPLE"],
      createdAt: new Date().toISOString(),
    };
    s.pack = pack;
    return copy(pack);
  },

  async listPostingLog() {
    await wait();
    return copy(postingRows());
  },

  async syncSheet() {
    await wait();
    const n = postingRows().length;
    return { log: `Read ${n} rows from the Posting Log, saved Approved scripts to testdata/approved` };
  },

  async getSettings() {
    await wait();
    return copy(state.settings);
  },

  async saveSettings(settings) {
    await wait();
    state.settings = copy(settings);
    return copy(state.settings);
  },

  async getKeyStatus() {
    await wait();
    return { GEMINI_API_KEY: true, ANTHROPIC_API_KEY: false };
  },
};
