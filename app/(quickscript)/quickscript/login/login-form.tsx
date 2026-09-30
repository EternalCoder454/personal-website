"use client";

import { useState } from "react";

const ADDRESS = "zachary@eterneon.net";

/* Same rule as the server: same-site paths under /quickscript only. */
function safeNext(next: string): string {
  return next.startsWith("/quickscript") &&
    !next.startsWith("//") &&
    !next.includes("\\") &&
    !next.startsWith("/quickscript/login")
    ? next
    : "/quickscript";
}

async function post(url: string, body: object) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      left?: number;
      wait?: number;
    };
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { error: "email_failed" } };
  }
}

const field =
  "block w-full rounded-md border border-outline bg-surface-low px-3 py-2 text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const button =
  "rounded-md bg-cta px-4 py-2 text-on-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60";

export function LoginForm({ next }: { next: string }) {
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState(ADDRESS);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function requestError(code?: string, wait?: number) {
    if (code === "rate_limited") return `Wait ${wait ?? 60} seconds`;
    if (code === "not_configured") return "Not configured";
    return "Email failed";
  }

  async function request(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError("");
    const { ok, data } = await post("/api/quickscript/login/request", { email });
    setBusy(false);
    if (!ok) return setError(requestError(data.error, data.wait));
    setPassword("");
    setStep("password");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { ok, data } = await post("/api/quickscript/login/verify", { password });
    if (ok) {
      window.location.assign(safeNext(next));
      return;
    }
    setBusy(false);
    if (data.error === "wrong") {
      const left = data.left ?? 0;
      setError(`Wrong password, ${left} ${left === 1 ? "try" : "tries"} left`);
    } else if (data.error === "locked") setError("Too many tries, send a new one");
    else if (data.error === "expired") setError("Expired, send a new one");
    else if (data.error === "not_configured") setError("Not configured");
    else setError("Sign in failed");
  }

  return (
    <main className="mx-auto w-full max-w-sm px-5 py-16 text-on-surface">
      <h1 className="mb-8 text-xl">Sign in</h1>

      {step === "email" ? (
        <form onSubmit={request} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm text-on-surface-variant">Email</span>
            <input
              className={field}
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button className={button} disabled={busy}>
            Email me a password
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm text-on-surface-variant">Password</span>
            <input
              className={`${field} font-mono tracking-widest`}
              type="text"
              name="password"
              autoComplete="one-time-code"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <div className="flex items-center gap-4">
            <button className={button} disabled={busy}>
              Sign in
            </button>
            <button
              type="button"
              onClick={() => request()}
              disabled={busy}
              className="text-sm text-on-surface-variant underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Send a new one
            </button>
          </div>
        </form>
      )}

      <p role="alert" className="mt-4 min-h-6 text-sm text-error">
        {error}
      </p>
    </main>
  );
}
