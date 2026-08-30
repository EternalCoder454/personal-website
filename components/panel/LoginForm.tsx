"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type Social = { github: boolean; discord: boolean };

export default function LoginForm({ social }: { social: Social }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const anySocial = social.github || social.discord;

  async function handlePassword(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const { data, error } = await authClient.signIn.username({ username, password });

    if (error) {
      setError(error.message ?? "That didn't work. Check the username and password.");
      setBusy(false);
      return;
    }

    /* Once 2FA is on, sign-in stops here and asks for the code. */
    if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
      setNeedsTotp(true);
      setBusy(false);
      return;
    }

    router.push("/panel");
    router.refresh();
  }

  async function handleTotp(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const { error } = await authClient.twoFactor.verifyTotp({ code });

    if (error) {
      setError(error.message ?? "That code was not accepted.");
      setBusy(false);
      return;
    }

    router.push("/panel");
    router.refresh();
  }

  return (
    <section className="card panel-auth">
      <h1 className="panel-auth__title">{needsTotp ? "Two-factor code" : "Sign in"}</h1>

      {needsTotp ? (
        <form className="panel-form" onSubmit={handleTotp}>
          <label className="field">
            <span className="field__label">6-digit code</span>
            <input
              className="field__input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              autoFocus
            />
          </label>
          {error && <p className="field__error">{error}</p>}
          <button className="button button--filled" type="submit" disabled={busy}>
            {busy ? "Checking…" : "Verify"}
          </button>
        </form>
      ) : (
        <form className="panel-form" onSubmit={handlePassword}>
          <label className="field">
            <span className="field__label">Username</span>
            <input
              className="field__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
          </label>
          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="field__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="field__error">{error}</p>}
          <button className="button button--filled" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      )}

      {anySocial && !needsTotp && (
        <>
          <p className="panel-auth__divider">or</p>
          <div className="panel-auth__social">
            {social.github && (
              <button
                className="button button--tonal"
                type="button"
                onClick={() =>
                  authClient.signIn.social({ provider: "github", callbackURL: "/panel" })
                }
              >
                Continue with GitHub
              </button>
            )}
            {social.discord && (
              <button
                className="button button--tonal"
                type="button"
                onClick={() =>
                  authClient.signIn.social({ provider: "discord", callbackURL: "/panel" })
                }
              >
                Continue with Discord
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
