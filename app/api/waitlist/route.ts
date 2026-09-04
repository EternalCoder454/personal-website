import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { start } from "@/lib/perf";
import { deliver } from "@/lib/deliver";

export const runtime = "nodejs";

type Payload = {
  email?: unknown;
  /* Hidden field. A browser leaves it empty, most bots fill it in. */
  website?: unknown;
};

const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;

/**
 * A speed bump, not a rate limiter.
 *
 * This map lives in one server instance. A second instance has its own
 * copy, so the real ceiling is this number times however many instances
 * are warm. Anything that has to hold across instances needs shared
 * state, and this endpoint does not justify the dependency yet.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function overLimit(ip: string): number | null {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    const retryMs = WINDOW_MS - (now - recent[0]);
    return Math.max(1, Math.ceil(retryMs / 60000));
  }

  recent.push(now);
  hits.set(ip, recent);

  /* Sweep every call, not only past some size threshold.
     The privacy notice says an address is held for ten minutes. A
     conditional sweep made that false: on a quiet site the map never
     reached the threshold, so an address that submitted once stayed in
     memory for the life of the instance. Sweeping unconditionally is a
     few microseconds at this scale and it makes the claim true. */
  for (const [key, times] of hits) {
    const live = times.filter((t) => now - t < WINDOW_MS);
    if (live.length === 0) hits.delete(key);
    else hits.set(key, live);
  }

  return null;
}

export async function POST(request: Request) {
  /* The whole request, so the phases below can be read as a share of it. */
  const total = start("waitlist:total");
  /* Platform headers first. The leftmost x-forwarded-for entry is
     whatever the client sent under any proxy that appends rather than
     overwrites, so keying the limit on it means an attacker rotates one
     header and the ceiling disappears. Only fall back to XFF, and take
     the rightmost hop, which is the one our proxy added. */
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    forwarded?.split(",").pop()?.trim() ||
    "unknown";

  const doneLimit = start("waitlist:rate-limit");
  const minutes = overLimit(ip);
  doneLimit();
  if (minutes !== null) {
    total(false);
    return NextResponse.json(
      { error: `Too many requests. Try again in ${minutes} minutes.` },
      { status: 429 },
    );
  }

  const doneParse = start("waitlist:parse");
  /* A route handler has no body-size limit of its own, and without a
     content-type check a cross-site form with enctype="text/plain" can
     post a parseable body without a preflight. Both are cheap to close. */
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    total(false);
    return NextResponse.json({ error: "Send JSON." }, { status: 415 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 4096) {
    total(false);
    return NextResponse.json({ error: "That request is too large." }, { status: 413 });
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    doneParse(false);
    total(false);
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }
  doneParse();

  /* Validate at the boundary, then work with values that are known good. */
  if (typeof body.website === "string" && body.website.length > 0) {
    /* Honeypot. Answer as though it worked, and store nothing. */
    total();
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!isEmail(email)) {
    total(false);
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const payload = {
    email,
    receivedAt: new Date().toISOString(),
    source: "landing",
  };

  const delivery = await deliver(payload);

  if (delivery.kind === "unconfigured") {
    /* Fail closed rather than accept a request nothing will read. */
    console.error(
      "[waitlist] no RESEND_API_KEY and no WAITLIST_WEBHOOK_URL. Rejecting rather than dropping the lead.",
    );
    total(false);
    return NextResponse.json(
      {
        error: `This form is not connected yet. Email ${site.contactEmail} and we will pick it up from there.`,
      },
      { status: 503 },
    );
  }

  if (delivery.kind === "failed") {
    console.error(`[waitlist] ${delivery.via} delivery failed:`, delivery.detail);
    total(false);
    return NextResponse.json(
      {
        error: `We could not record that. Email ${site.contactEmail} and we will add you by hand.`,
      },
      { status: 502 },
    );
  }

  total();
  return NextResponse.json({ ok: true });
}
