import { NextResponse, type NextRequest } from "next/server";
import {
  CHALLENGE_COOKIE,
  SESSION_COOKIE,
  SESSION_TTL_S,
  cookieBase,
  getSecret,
  newSession,
  sameOrigin,
  verifyChallenge,
} from "@/lib/quickscript/auth";

export const runtime = "nodejs";

const json = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);

  const secret = getSecret();
  if (!secret) return json({ error: "not_configured" }, 503);

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body.password === "string") password = body.password.slice(0, 64);
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const result = verifyChallenge(
    request.cookies.get(CHALLENGE_COOKIE)?.value,
    password,
    secret,
  );

  if (!result.ok) {
    if (result.reason === "wrong") {
      return json({ error: "wrong", left: result.left }, 401);
    }
    const response = json({ error: result.reason }, 401);
    response.cookies.delete(CHALLENGE_COOKIE);
    return response;
  }

  const response = json({ ok: true });
  response.cookies.set(SESSION_COOKIE, newSession(secret), {
    ...cookieBase,
    maxAge: SESSION_TTL_S,
  });
  response.cookies.delete(CHALLENGE_COOKIE);
  return response;
}
