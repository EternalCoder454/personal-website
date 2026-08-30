"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

/* Stage 3. Enabling 2FA needs the current password, then a code from the
   authenticator to confirm the secret actually landed. */
export default function SecurityCard() {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function enable(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const { data, error } = await authClient.twoFactor.enable({ password });

    /* enable() can return either an OTP or a TOTP shape; only TOTP carries
       a URI and backup codes. */
    if (error || !data || !("totpURI" in data)) {
      setError(error?.message ?? "Could not start 2FA setup.");
      setBusy(false);
      return;
    }

    setUri(data.totpURI);
    setSecret(new URL(data.totpURI).searchParams.get("secret") ?? "");
    setBackupCodes(data.backupCodes ?? []);
    setPassword("");
    setBusy(false);
  }

  async function confirm(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const { error } = await authClient.twoFactor.verifyTotp({ code });

    if (error) {
      setError(error.message ?? "That code was not accepted.");
      setBusy(false);
      return;
    }

    setDone(true);
    setBusy(false);
  }

  return (
    <section className="card card--flush" aria-labelledby="panel-security">
      <h2 className="card__header" id="panel-security">
        Security
      </h2>

      <div className="panel-security">
        {done ? (
          <p className="panel-security__note">
            Two-factor authentication is on. Keep your backup codes somewhere safe.
          </p>
        ) : !uri ? (
          <form className="editor__form" onSubmit={enable}>
            <label className="field field--inline">
              <span className="field__label">Current password</span>
              <input
                className="field__input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <button className="button button--filled" type="submit" disabled={busy}>
              {busy ? "Working…" : "Turn on 2FA"}
            </button>
          </form>
        ) : (
          <>
            <p className="panel-security__note">
              Add this secret to your authenticator app, then enter a code to confirm.
            </p>
            <code className="panel-security__secret">{secret}</code>

            {backupCodes.length > 0 && (
              <>
                <p className="panel-security__note">
                  Backup codes - each works once. Save them now.
                </p>
                <ul className="panel-security__codes">
                  {backupCodes.map((c) => (
                    <li key={c}>
                      <code>{c}</code>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <form className="editor__form" onSubmit={confirm}>
              <label className="field field--inline field--narrow">
                <span className="field__label">Code</span>
                <input
                  className="field__input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </label>
              <button className="button button--filled" type="submit" disabled={busy}>
                {busy ? "Checking…" : "Confirm"}
              </button>
            </form>
          </>
        )}

        {error && <p className="field__error">{error}</p>}
      </div>
    </section>
  );
}
