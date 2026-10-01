import type {
  ActionResult,
  DraftRequest,
  KeyStatus,
  LastRun,
  PostingRow,
  Provider,
  PublishPack,
  Recipient,
  Script,
  Settings,
  WeekState,
  WeeklyResult,
} from "./types";
import { mockClient } from "./mock";

/**
 * Every piece of data on the page goes through this one interface. The mock
 * below it keeps state in memory. The Go program will answer the same calls
 * over JSON: see API.md for each method's path, request and response.
 *
 * Methods reject with an Error whose message is shown inline. Actions resolve
 * with a single log line.
 */
export interface QuickScriptClient {
  getWeek(): Promise<WeekState>;
  /** quickscript weekly: topics, draft, keep the strongest, send them. With dryRun nothing is written or sent. Returns what the run did. */
  runWeekly(req: { dryRun: boolean; to: Recipient }): Promise<WeeklyResult>;
  /** quickscript topics */
  findTopics(): Promise<ActionResult>;
  /** quickscript draft --top N, or the chosen topics. */
  draft(req: DraftRequest): Promise<ActionResult>;
  /** quickscript publish-drafts for every draft of the week. */
  sendDrafts(req: { to: Recipient }): Promise<ActionResult>;
  /** quickscript setup-drive */
  setupDrive(): Promise<ActionResult>;

  listScripts(): Promise<Script[]>;
  sendScript(slug: string, to: Recipient): Promise<ActionResult>;
  redraft(slug: string, req: { provider: Provider; model: string }): Promise<ActionResult>;
  /** quickscript pack <slug>. Only for a script the Host approved. */
  makePack(slug: string): Promise<PublishPack>;

  listPostingLog(): Promise<PostingRow[]>;
  /** quickscript sync */
  syncSheet(): Promise<ActionResult>;

  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<Settings>;
  getKeyStatus(): Promise<KeyStatus>;
}

export { mockClient };

/** Same-origin only: the Next route forwards to the Go server. */
/*
 * Go encodes an empty slice as null. The page reads these lists straight
 * away, so a week with nothing held back must not crash it: fill them in once
 * here, as they arrive.
 */
function normaliseRun(run: LastRun | undefined | null): LastRun | undefined {
  if (!run) return undefined;
  return {
    ...run,
    sent: run.sent ?? [],
    held: (run.held ?? []).map((h) => ({ ...h, reasons: h.reasons ?? [] })),
  };
}

function normaliseWeek(week: WeekState): WeekState {
  return {
    ...week,
    steps: week.steps ?? [],
    topics: week.topics ?? [],
    collectors: week.collectors ?? [],
    log: week.log ?? [],
    lastRun: normaliseRun(week.lastRun),
    recentRuns: week.recentRuns ?? [],
  };
}

export function httpClient(): QuickScriptClient {
  const base = "/api/quickscript";

  async function call<T>(method: "GET" | "POST" | "PUT", path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetch(base + path, {
        method,
        headers: body === undefined ? undefined : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
        credentials: "same-origin",
      });
    } catch {
      throw new Error("Could not reach the QuickScript server");
    }
    if (!res.ok) {
      let message = "";
      try {
        const j = (await res.json()) as { error?: string };
        message = j.error ?? "";
      } catch {
        // not JSON, use the status line
      }
      throw new Error(message || `Server answered ${res.status}`);
    }
    return (await res.json()) as T;
  }

  const slug = (s: string) => encodeURIComponent(s);

  return {
    getWeek: () => call<WeekState>("GET", "/week").then(normaliseWeek),
    runWeekly: (req) =>
      call<WeeklyResult>("POST", "/run/weekly", req).then((r) => ({ ...r, run: normaliseRun(r.run) ?? r.run })),
    findTopics: () => call("POST", "/run/topics"),
    draft: (req) => call("POST", "/run/draft", req),
    sendDrafts: (req) => call("POST", "/run/send", req),
    setupDrive: () => call("POST", "/run/setup-drive"),
    listScripts: () => call("GET", "/scripts"),
    sendScript: (s, to) => call("POST", `/scripts/${slug(s)}/send`, { to }),
    redraft: (s, req) => call("POST", `/scripts/${slug(s)}/redraft`, req),
    makePack: (s) => call("POST", `/scripts/${slug(s)}/pack`),
    listPostingLog: () => call("GET", "/posting-log"),
    syncSheet: () => call("POST", "/posting-log/sync"),
    getSettings: () => call("GET", "/settings"),
    saveSettings: (settings) => call("PUT", "/settings", settings),
    getKeyStatus: () => call("GET", "/keys"),
  };
}

/**
 * Sample data only in development, and only when NEXT_PUBLIC_QUICKSCRIPT_SAMPLE
 * is "1". A production build always calls the backend, so the console never
 * shows made-up scripts as if they were real. A flag, never a URL.
 */
export const usesSampleData =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_QUICKSCRIPT_SAMPLE === "1";

export function pickClient(): QuickScriptClient {
  return usesSampleData ? mockClient : httpClient();
}
