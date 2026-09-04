"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { site } from "@/lib/site";

/**
 * The only call to action on the page.
 *
 * One field, because every extra field costs completions and we can ask
 * for a business name in the reply. The button wears the one bone-bright
 * fill on the site, and nothing else does.
 */

type State = "idle" | "sending" | "done";

export function Cta({ size = "large" }: { size?: "large" | "compact" }) {
  const ids = useId();
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  /* Submitting unmounts the button that had focus, so without this the
     caret lands back on <body> and a keyboard user loses their place. */
  useEffect(() => {
    if (state === "done") doneRef.current?.focus();
  }, [state]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setState("sending");

    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        /* A hung server would otherwise leave the button reading
           "Sending" with no way out. */
        signal: AbortSignal.timeout(12000),
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          website: data.get("website"),
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Something went wrong. Try that again.");
        setState("idle");
        return;
      }

      setState("done");
    } catch {
      setError(`We couldn't reach the server. Email ${site.contactEmail} instead.`);
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        className={`border-l-2 border-cta bg-surface-low px-6 py-6 outline-none ${
          size === "large" ? "max-w-[34rem]" : "max-w-[30rem]"
        }`}
      >
        <p className="t-title text-[19px] text-on-surface">You&rsquo;re on the list.</p>
        <p className="t-body-sm mt-2 text-on-surface-variant">
          We&rsquo;ll email you when the next set of invitations goes out. Nothing else will arrive
          from us in the meantime.
        </p>
      </div>
    );
  }

  return (
    <div className={size === "large" ? "max-w-[34rem]" : "max-w-[30rem]"}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`${ids}-email`} className="sr-only">
          Work email
        </label>
        <input
          id={`${ids}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@yourbusiness.com"
          className="min-h-[52px] w-full flex-1 rounded-[var(--radius-sm)] border border-outline bg-surface-lowest px-4 t-body text-on-surface placeholder:text-on-surface-muted transition-colors duration-100 ease-[var(--ease-standard)] hover:border-on-surface-muted focus:border-cta focus:outline-none"
        />

        {/* Hidden from people, offered to bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor={`${ids}-website`}>Website</label>
          <input id={`${ids}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <button
          type="submit"
          disabled={state === "sending"}
          className="min-h-[52px] shrink-0 rounded-[var(--radius-sm)] bg-cta px-7 t-title text-[16px] whitespace-nowrap text-on-cta transition-colors duration-100 ease-[var(--ease-standard)] hover:bg-on-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === "sending" ? "Sending" : "Request beta access"}
        </button>
      </form>

      {error ? (
        <p
          role="alert"
          className="t-body-sm mt-3 rounded-[var(--radius-sm)] border border-error/40 bg-error-container/40 px-4 py-3 text-error"
        >
          {error}
        </p>
      ) : null}

      {/* The notice belongs at the point of collection, not only in a
          footer somebody has to go looking for.

          It used to open with "No credit card, now or ever", which the
          trust strip 200px below already says. One line, one claim, and
          the deletion detail lives behind the link where it belongs. */}
      <p className="t-body-sm mt-4 text-pretty text-on-surface-muted">
        We only use your address to send your invitation.{" "}
        <Link
          href="/privacy"
          className="underline decoration-outline underline-offset-4 transition-colors duration-100 hover:text-primary hover:decoration-primary"
        >
          What we collect
        </Link>
        .
      </p>
    </div>
  );
}
