import "server-only";
import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { siteUrl } from "@/lib/site";

/**
 * QuickScript sign-in: one address, a fresh emailed password each time.
 *
 * Nothing is stored in plain text. The challenge cookie carries a hash of
 * the id and the password, signed with QUICKSCRIPT_SECRET. The counters
 * below live in one server instance, like the waitlist limiter.
 */

/**
 * Who may sign in: the owner, and his boss so QuickScript can be taken over.
 * A password is only ever emailed to the matching entry here, never to what
 * somebody typed, and a password signs in only the person it was sent to.
 */
export const ALLOWED_EMAILS: readonly string[] = ["zachary@eterneon.net", "james@skorheim.com"];

/** The canonical allowed address for this input, or null. */
export function allowedAddress(input: string): string | null {
  const email = input.trim().toLowerCase();
  return ALLOWED_EMAILS.find((address) => address === email) ?? null;
}
export const SESSION_COOKIE = "qs_session";
export const CHALLENGE_COOKIE = "qs_challenge";
export const CHALLENGE_TTL_S = 10 * 60;
export const SESSION_TTL_S = 8 * 60 * 60;
export const MAX_TRIES = 5;

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0 O 1 I L

type Challenge = { typ: "c"; id: string; sub: string; exp: number; h: string };
type Session = { typ: "s"; jti: string; sub: string; iat: number; exp: number };

type State = {
  tries: Map<string, number>;
  used: Map<string, number>;
  sent: number[];
  ipSent: Map<string, number[]>;
  revoked: Map<string, number>;
};
const g = globalThis as unknown as { __qsState?: State };
const state: State = (g.__qsState ??= {
  tries: new Map(),
  used: new Map(),
  sent: [],
  ipSent: new Map(),
  revoked: new Map(),
});

const now = () => Math.floor(Date.now() / 1000);

/** The secret, or null when missing or too short. Callers fail closed. */
export function getSecret(): string | null {
  const s = process.env.QUICKSCRIPT_SECRET;
  return s && s.length >= 32 ? s : null;
}

const b64 = (v: string) => Buffer.from(v, "utf8").toString("base64url");

function sign(payload: object, secret: string): string {
  const body = b64(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function unsign<T>(value: string | undefined, secret: string | null): T | null {
  if (!value || !secret) return null;
  const [body, sig, extra] = value.split(".");
  if (!body || !sig || extra !== undefined) return null;
  const want = createHmac("sha256", secret).update(body).digest();
  const got = Buffer.from(sig, "base64url");
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

const digest = (id: string, password: string, secret: string) =>
  createHmac("sha256", secret).update(`c:${id}:${password}`).digest("hex");

/** Twelve characters in three groups of four. */
export function generatePassword(): string {
  let out = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) out += "-";
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}

const normalisePassword = (input: string) =>
  input.toUpperCase().replace(/[\s-]/g, "");

export function newChallenge(password: string, secret: string, sub: string) {
  const id = randomBytes(12).toString("base64url");
  const exp = now() + CHALLENGE_TTL_S;
  const plain = normalisePassword(password);
  return { id, exp, cookie: sign({ typ: "c", id, sub, exp, h: digest(id, plain, secret) }, secret) };
}

export type VerifyResult =
  | { ok: true; sub: string }
  | { ok: false; reason: "expired" | "locked" | "wrong"; left?: number };

function sweep() {
  const t = now();
  for (const [id, exp] of state.used) if (exp < t) state.used.delete(id);
}

/** Checks a typed password against the challenge cookie. */
export function verifyChallenge(
  cookieValue: string | undefined,
  input: string,
  secret: string,
): VerifyResult & { id?: string } {
  sweep();
  const c = unsign<Challenge>(cookieValue, secret);
  if (
    !c ||
    c.typ !== "c" ||
    typeof c.id !== "string" ||
    typeof c.exp !== "number" ||
    typeof c.h !== "string" ||
    typeof c.sub !== "string" ||
    !ALLOWED_EMAILS.includes(c.sub) ||
    c.exp <= now() ||
    state.used.has(c.id)
  ) {
    return { ok: false, reason: "expired" };
  }
  const count = state.tries.get(c.id) ?? 0;
  if (count >= MAX_TRIES) return { ok: false, reason: "locked", id: c.id };

  const want = Buffer.from(c.h, "utf8");
  const got = Buffer.from(digest(c.id, normalisePassword(input), secret), "utf8");
  if (want.length === got.length && timingSafeEqual(want, got)) {
    state.used.set(c.id, c.exp);
    state.tries.delete(c.id);
    return { ok: true, sub: c.sub, id: c.id };
  }

  const next = count + 1;
  state.tries.set(c.id, next);
  if (next >= MAX_TRIES) {
    state.used.set(c.id, c.exp);
    state.tries.delete(c.id);
    return { ok: false, reason: "locked", id: c.id };
  }
  return { ok: false, reason: "wrong", left: MAX_TRIES - next, id: c.id };
}

export function newSession(secret: string, sub: string): string {
  const iat = now();
  const jti = randomBytes(16).toString("base64url");
  return sign({ typ: "s", jti, sub, iat, exp: iat + SESSION_TTL_S }, secret);
}

/** The session behind a cookie value, or null. Also null with no secret. */
export function readSession(cookieValue: string | undefined): Session | null {
  const s = unsign<Session>(cookieValue, getSecret());
  if (
    !s ||
    s.typ !== "s" ||
    !ALLOWED_EMAILS.includes(s.sub) ||
    typeof s.exp !== "number" ||
    typeof s.jti !== "string"
  ) {
    return null;
  }
  const t = now();
  for (const [j, exp] of state.revoked) if (exp < t) state.revoked.delete(j);
  if (state.revoked.has(s.jti)) return null;
  return s.exp > t ? s : null;
}

/** Logout: refuse this session from now on, until it would have expired. */
export function revokeSession(cookieValue: string | undefined) {
  const s = unsign<Session>(cookieValue, getSecret());
  if (s && s.typ === "s" && typeof s.jti === "string") {
    state.revoked.set(s.jti, s.exp);
  }
}

/** The client address as Caddy reports it. */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** For server components: is this request signed in? */
export async function hasQuickScriptSession(): Promise<boolean> {
  const jar = await cookies();
  return readSession(jar.get(SESSION_COOKIE)?.value) !== null;
}

/**
 * Per client address: one email per 60 seconds, three per hour. Then for
 * the whole site: one per 15 seconds, twenty per hour. Returns the seconds
 * to wait, or null and records the send.
 */
function wait(list: number[], gapMs: number, cap: number, t: number) {
  const last = list[list.length - 1];
  if (last !== undefined && t - last < gapMs) {
    return Math.ceil((gapMs - (t - last)) / 1000);
  }
  if (list.length >= cap) return Math.ceil((3600_000 - (t - list[0])) / 1000);
  return null;
}

export function rateLimit(ip: string): number | null {
  const t = Date.now();
  for (const [k, v] of state.ipSent) {
    const live = v.filter((x) => t - x < 3600_000);
    if (live.length) state.ipSent.set(k, live);
    else state.ipSent.delete(k);
  }
  state.sent = state.sent.filter((x) => t - x < 3600_000);
  const mine = state.ipSent.get(ip) ?? [];
  const w = wait(mine, 60_000, 3, t) ?? wait(state.sent, 15_000, 20, t);
  if (w !== null) return w;
  mine.push(t);
  state.ipSent.set(ip, mine);
  state.sent.push(t);
  return null;
}

/** Give the slot back after a definite failure from the mail service. */
export function refundSend(ip: string) {
  state.sent.pop();
  const mine = state.ipSent.get(ip);
  mine?.pop();
  if (mine && !mine.length) state.ipSent.delete(ip);
}

/** CSRF: the Origin header must be the site's own origin. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let o: URL;
  try {
    o = new URL(origin);
  } catch {
    return false;
  }
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host && o.host === host) return true;
  try {
    return o.origin === new URL(siteUrl).origin;
  } catch {
    return false;
  }
}

export const cookieBase = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/** Only same-site relative paths under /quickscript are honoured. */
export function safeNext(next: string | null | undefined): string {
  if (
    next &&
    next.startsWith("/quickscript") &&
    !next.startsWith("//") &&
    !next.includes("\\") &&
    !next.startsWith("/quickscript/login") &&
    !/[\r\n]/.test(next)
  ) {
    return next;
  }
  return "/quickscript";
}
