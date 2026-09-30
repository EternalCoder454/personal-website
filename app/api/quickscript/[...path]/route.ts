import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession, sameOrigin } from "@/lib/quickscript/auth";

export const runtime = "nodejs";

const json = (body: object, status: number) =>
  NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });

/**
 * The only way the browser reaches the Go server. Checks the session
 * again (the proxy already did), then forwards to QUICKSCRIPT_BACKEND_URL,
 * which is server-only and meant to be http://127.0.0.1:<port>.
 * The login and logout routes are separate folders and win over this one.
 */
async function forward(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  if (!readSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return json({ error: "unauthorized" }, 401);
  }
  if (request.method !== "GET" && !sameOrigin(request)) {
    return json({ error: "forbidden" }, 403);
  }

  const backend = process.env.QUICKSCRIPT_BACKEND_URL;
  if (!backend) return json({ error: "backend not connected" }, 503);

  const { path } = await ctx.params;
  if (path.some((p) => p === ".." || p === ".")) {
    return json({ error: "bad request" }, 400);
  }
  let url: URL;
  try {
    url = new URL(
      `${backend.replace(/\/+$/, "")}/${path.map(encodeURIComponent).join("/")}`,
    );
  } catch {
    return json({ error: "backend not connected" }, 503);
  }
  url.search = request.nextUrl.search;

  try {
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const res = await fetch(url, {
      method: request.method,
      headers: hasBody ? { "content-type": "application/json" } : undefined,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(120_000),
    });
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return json({ error: `backend answered ${res.status}` }, 502);
    }
    return NextResponse.json(data, {
      status: res.status,
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return json({ error: "backend not reachable" }, 502);
  }
}

export { forward as GET, forward as POST, forward as PUT };
