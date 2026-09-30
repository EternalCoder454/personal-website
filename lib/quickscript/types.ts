/*
 * Types for QuickScript. They mirror the Go structs in the Builder Manual, so
 * the JSON the Go program writes decodes straight into them. Field names are
 * the JSON names (lower camel case).
 */

export type Provider = "gemini" | "claude";

/** The three places the program calls a model. */
export type Task = "ranking" | "drafts" | "publishPack";

export type ModelChoice = {
  provider: Provider;
  /** The provider's own model id, editable. */
  model: string;
};

export type Season = "evergreen" | "inseason";
export type SeasonSetting = "auto" | Season;

/** Go: type Topic struct { Question, Source string; Score float64; SeenAt time.Time } */
export type Topic = {
  question: string;
  source: string;
  score: number;
  /** RFC 3339 */
  seenAt: string;
};

/** A topic after rank/rank.go: duplicates merged, weights and boosts applied. */
export type RankedTopic = Topic & {
  /** Stable id, the slug of the question. */
  id: string;
  /** Every source that surfaced it, after duplicate removal. */
  sources: string[];
  /** Tied to a near IRS deadline and boosted for it. */
  deadlineBoost: boolean;
  /** Matched a high-end word and pushed down. */
  highEndDemoted: boolean;
  /** A script for it already exists this week. */
  drafted: boolean;
};

export type SourceId = "ytsuggest" | "youtube" | "trends" | "irs" | "inbox" | "reddit";

export type CollectorState = "ok" | "failed" | "cached" | "off";

/** One collector's last run (Go: Collector.Name, and its last Collect result). */
export type CollectorStatus = {
  id: SourceId;
  name: string;
  state: CollectorState;
  /** RFC 3339, absent when it never ran. */
  lastRun?: string;
  /** Error text when failed, reason when off. */
  note?: string;
};

export type StepKey =
  | "topics"
  | "drafts"
  | "sent"
  | "approved"
  | "recorded"
  | "edited"
  | "scheduled"
  | "clipped";

export type Role = "Program" | "Host" | "Producer" | "Clipper";

export type PipelineStep = {
  key: StepKey;
  label: string;
  who: Role;
  state: "done" | "partial" | "todo";
  /** For example "2 of 3". */
  detail?: string;
};

export type WeekState = {
  /** YYYY-MM-DD, the Monday of the week. */
  weekOf: string;
  steps: PipelineStep[];
  topics: RankedTopic[];
  collectors: CollectorStatus[];
  /** Whether setup-drive has run. */
  driveReady: boolean;
  /** Lines from data/logs for the last run. */
  log: string[];
  /** The last weekly run, scheduled or by hand. Absent when none has run. */
  lastRun?: LastRun;
  /** The last 6 weekly runs, newest first, the last one included. */
  recentRuns: RunSummary[];
};

/** One cell of the recent runs strip. */
export type RunSummary = {
  /** RFC 3339 */
  ranAt: string;
  /** "good" sent what it should, "attention" held something back, "failed" stopped with an error, "missed" never started at its scheduled time. */
  state: "good" | "attention" | "failed" | "missed";
  sent: number;
  held: number;
}

/** How strong a topic has to be for its script to go out by itself. */
export type MinStrength = "strong" | "good";

/** One script a run emailed, with the checks it passed or failed. */
export type SentScript = {
  slug: string;
  topic: string;
  /** The topic's score. The page turns it into Strong, Good or Weak. */
  score: number;
  checks: {
    words: number;
    lengthOk: boolean;
    disclaimerOk: boolean;
    /** Lines marked NOT VERIFIED. 0 means every number was found. */
    unverifiedNumbers: number;
  };
};

/** One script a run wrote but did not email, and why. */
export type HeldScript = {
  slug: string;
  topic: string;
  score: number;
  /** Plain fragments, for example "2 numbers need checking". */
  reasons: string[];
};

/** What one weekly run did. The same shape comes back from /run/weekly and /week. */
export type LastRun = {
  /** RFC 3339 */
  ranAt: string;
  /** The schedule started it, or a person pressed the button. */
  trigger: "schedule" | "hand";
  /** False when the run stopped with an error. */
  ok: boolean;
  /** Plain text of what went wrong, when ok is false. */
  error?: string;
  topicsFound: number;
  topicsKept: number;
  scriptsWritten: number;
  /** The address the scripts went to. Empty when nothing was sent. */
  sentTo: string;
  sent: SentScript[];
  held: HeldScript[];
  /** The rule the run applied, in plain words. Same text as HOW_CHOSEN in logic.ts. */
  rule: string;
};

/** The weekly run's result: the usual log line, and what the run did. */
export type WeeklyResult = ActionResult & { run: LastRun };

/** Posting log statuses, in order. Also the script status. */
export const STATUSES = [
  "Draft",
  "Approved",
  "Recorded",
  "Edited",
  "Scheduled",
  "Clipped",
  "In Meta Ads",
] as const;
export type Status = (typeof STATUSES)[number];

/** Who sets each status, from the Builder Manual. */
export const STATUS_SETTER: Record<Status, Role> = {
  Draft: "Program",
  Approved: "Host",
  Recorded: "Host",
  Edited: "Producer",
  Scheduled: "Producer",
  Clipped: "Clipper",
  "In Meta Ads": "Clipper",
};

export type Recipient = "me" | "host";

export type PublishPack = {
  /** Three options. */
  titles: string[];
  description: string;
  playlist: string;
  /** Three to five words. */
  thumbnailWords: string[];
  /** RFC 3339 */
  createdAt: string;
};

export type Script = {
  /** The file name under data/YYYY-MM-DD/scripts/, without .md */
  slug: string;
  topic: string;
  taxYear: number;
  status: Status;
  /** Who the draft was last emailed to. */
  sentTo?: Recipient;
  /** The score of the topic it answers. */
  score?: number;
  /** What the weekly run did with it. Absent when it has not been through a run. */
  delivery?:
    | { state: "sent"; /** The address. */ to: string; /** RFC 3339 */ at: string; /** True when the schedule sent it, false when a person pressed the button. */ automatic: boolean }
    | { state: "held"; reasons: string[] };
  sources: string[];
  model: ModelChoice;
  /** RFC 3339 */
  createdAt: string;
  /** The script, then a line of "---", then the model's list of numbers. */
  text: string;
  pack?: PublishPack;
};

export type PostingRow = {
  slug: string;
  topic: string;
  status: Status;
  /** YYYY-MM-DD, keyed by the status that set the date. */
  dates: Partial<Record<Status, string>>;
  docUrl: string;
};

export type SourceSetting = {
  id: SourceId;
  name: string;
  enabled: boolean;
  /** Why it is off by default. */
  reason?: string;
};

/** The automatic run: find topics, write, keep the strongest, email them. */
export type AutomaticSettings = {
  /** False stops the schedule from sending. Default true. */
  enabled: boolean;
  /** Where the scripts go. Required. Defaults to people.hostEmail. */
  sendTo: string;
  /** The most scripts one run sends, 1 to 5. Default 3. In season the run sends 1. */
  maxScripts: number;
  /** Send only scripts that pass length, disclaimer and unchecked numbers. Default true. */
  onlyIfChecksPass: boolean;
  /** Default "good": Strong and Good topics. "strong": Strong only. */
  minStrength: MinStrength;
};

export type Settings = {
  automatic: AutomaticSettings;
  models: Record<Task, ModelChoice>;
  seedWords: string[];
  highEndWords: string[];
  sources: SourceSetting[];
  people: { hostEmail: string; testRecipient: string; clipperEmail: string };
  schedule: {
    /** 0 is Sunday. */
    day: number;
    /** HH:MM, 24 hour. */
    time: string;
  };
  seasonOverride: SeasonSetting;
  taxYear: number;
};

/** Whether each key is set in the server's environment. Never the key. */
export type KeyStatus = {
  GEMINI_API_KEY: boolean;
  ANTHROPIC_API_KEY: boolean;
};

/** What every action returns: one short log line. */
export type ActionResult = {
  log: string;
};

export type DraftRequest = { count: number } | { topicIds: string[] };
