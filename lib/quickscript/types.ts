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
};

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

export type Settings = {
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
