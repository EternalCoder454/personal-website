import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, revokeSession, sameOrigin } from "@/lib/quickscript/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  revokeSession(request.cookies.get(SESSION_COOKIE)?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
