import type {
  ActionResult,
  DraftRequest,
  KeyStatus,
  PostingRow,
  Provider,
  PublishPack,
  Recipient,
  Script,
  Settings,
  WeekState,
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
  /** quickscript weekly: topics, draft, send. With dryRun nothing is written or sent. */
  runWeekly(req: { dryRun: boolean; to: Recipient }): Promise<ActionResult>;
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
    getWeek: () => call("GET", "/week"),
    runWeekly: (req) => call("POST", "/run/weekly", req),
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

/** The mock unless NEXT_PUBLIC_QUICKSCRIPT_LIVE is "1". A flag, never a URL. */
export function pickClient(): QuickScriptClient {
  return process.env.NEXT_PUBLIC_QUICKSCRIPT_LIVE === "1" ? httpClient() : mockClient;
}
