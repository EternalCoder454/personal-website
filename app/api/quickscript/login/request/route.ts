import { NextResponse } from "next/server";
import {
  ALLOWED_EMAIL,
  CHALLENGE_COOKIE,
  CHALLENGE_TTL_S,
  clientIp,
  cookieBase,
  generatePassword,
  getSecret,
  newChallenge,
  rateLimit,
  refundSend,
  sameOrigin,
} from "@/lib/quickscript/auth";
import { quickscriptPasswordEmail } from "@/lib/emails/quickscript-password";

export const runtime = "nodejs";

const json = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });

/** "sent", "rejected" (a definite non-2xx), or "unknown" (timeout, network). */
async function send(password: string): Promise<"sent" | "rejected" | "unknown"> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[quickscript] password (dev only): ${password}`);
      return "sent";
    }
    return "rejected";
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Eterneon <hello@eterneon.net>",
        to: [ALLOWED_EMAIL],
        ...quickscriptPasswordEmail(password),
      }),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok ? "sent" : "rejected";
  } catch {
    return "unknown";
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);

  const secret = getSecret();
  if (!secret) return json({ error: "not_configured" }, 503);

  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    if (typeof body.email === "string") email = body.email.trim().toLowerCase();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  /* Same answer for every other address, and nothing is sent. */
  if (email !== ALLOWED_EMAIL) return json({ ok: true });

  const ip = clientIp(request);
  const wait = rateLimit(ip);
  if (wait !== null) return json({ error: "rate_limited", wait }, 429);

  const password = generatePassword();
  const sent = await send(password);
  if (sent !== "sent") {
    /* A timeout may still have delivered, so only a definite refusal,
       or no key at all, gives the slot back. */
    if (sent === "rejected") refundSend(ip);
    const configured = Boolean(process.env.RESEND_API_KEY);
    return json(
      { error: configured ? "email_failed" : "not_configured" },
      configured ? 502 : 503,
    );
  }

  const challenge = newChallenge(password, secret);
  const response = json({ ok: true });
  response.cookies.set(CHALLENGE_COOKIE, challenge.cookie, {
    ...cookieBase,
    maxAge: CHALLENGE_TTL_S,
  });
  return response;
}
