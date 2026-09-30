"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { plainLogLine } from "@/lib/quickscript/logic";
import type { ActionResult } from "@/lib/quickscript/types";

/* Small pieces shared by the four QuickScript views. Plain controls on the
   site's dark tokens: no motion, no decoration. */

export const control =
  "min-h-11 w-full rounded-[var(--radius-sm)] border border-outline bg-surface-lowest px-3 text-base text-on-surface placeholder:text-on-surface-muted disabled:opacity-60";

const btnBase =
  "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] px-4 text-[15px] font-medium disabled:cursor-not-allowed disabled:opacity-50";

export function Btn({
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const look =
    variant === "primary"
      ? "bg-primary text-on-primary hover:bg-on-primary-container"
      : "border border-outline text-on-surface hover:bg-surface-container";
  return <button type={type} className={`${btnBase} ${look} ${className}`} {...props} />;
}

/* Three tonal levels, no card borders: the page, a card (surface-low) and an
   inset inside a card (surface-container). Lines are only dividers inside a card. */
export const CARD = "bg-surface-low";
export const INSET = "bg-surface-container";

export type MarkKind = "good" | "attention" | "failed" | "clock" | "dash";

const MARK_TONE: Record<MarkKind, string> = {
  good: "text-primary",
  attention: "text-[#e5c07b]",
  failed: "text-error",
  clock: "text-on-surface-variant",
  dash: "text-on-surface-variant",
};

/** A small shape that says the state without colour: tick, triangle, cross, clock, dash. */
export function Mark({ kind, size = 16 }: { kind: MarkKind; size?: number }) {
  const shape =
    kind === "good" ? (
      <path d="M3.5 8.5l3 3 6-7" />
    ) : kind === "attention" ? (
      <>
        <path d="M8 2.2l6.3 11H1.7z" />
        <path d="M8 6.6v3.2M8 11.6v.2" />
      </>
    ) : kind === "failed" ? (
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    ) : kind === "clock" ? (
      <>
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.6V8l2.2 1.4" />
      </>
    ) : (
      <path d="M3.5 8h9" />
    );
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${MARK_TONE[kind]}`}
    >
      {shape}
    </svg>
  );
}

/** A shape and its word, side by side. */
export function StateText({ kind, children, className = "" }: { kind: MarkKind; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-start gap-2 ${className}`}>
      <span className="mt-[5px]">
        <Mark kind={kind} />
      </span>
      <span className="min-w-0">{children}</span>
    </span>
  );
}

export function Panel({
  title,
  actions,
  children,
  className = "",
  inset = false,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** A panel inside another card: one step lighter, still no border. */
  inset?: boolean;
}) {
  return (
    <section className={`${inset ? INSET : CARD} p-4 sm:p-6 ${className}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="text-lg font-medium">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 text-sm text-on-surface-variant ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

/** The line that follows every failed action. */
function GuideHelp() {
  return (
    <>
      {" "}
      Try again in an hour. If it keeps failing, use the manual steps in the{" "}
      <Link href="/quickscript?view=guide" className="underline underline-offset-4">
        Guide
      </Link>
      .
    </>
  );
}

export function InlineError({ message, onRetry, help }: { message: string; onRetry?: () => void; help?: boolean }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 bg-error-container px-3 py-2 text-sm text-error"
    >
      <span>
        {message}
        {help && <GuideHelp />}
      </span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="underline underline-offset-4">
          Try again
        </button>
      )}
    </div>
  );
}

export function Loading({ what }: { what: string }) {
  return (
    <p role="status" className="py-6 text-on-surface-variant">
      Loading {what}
    </p>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-4 text-on-surface-variant">{children}</p>;
}

/** Result line of the last action, or its error, or the action in progress. */
export function ActionStatus({
  busy,
  message,
  detail,
  error,
  compact = false,
}: {
  busy: string | null;
  message: string | null;
  detail?: string | null;
  error: string | null;
  /** Takes no room while there is nothing to say. */
  compact?: boolean;
}) {
  const quiet = compact && !busy && !message && !detail && !error;
  return (
    <div className={`text-sm ${compact ? (quiet ? "" : "mb-4") : "min-h-6"}`}>
      <div role="status" aria-live="polite" className="text-on-surface-variant">
        {busy ? `${busy}, please wait` : message}
      </div>
      {detail && !busy && (
        <details className="mt-1 text-on-surface-muted">
          <summary className="cursor-pointer py-1">Show details</summary>
          <p className="t-value break-words">{detail}</p>
        </details>
      )}
      {error && <InlineError message={error} help={/could not reach|server had a problem/i.test(error)} />}
    </div>
  );
}

/** What to say when a send to the Host cannot go because no address is set. */
export const NO_HOST_EMAIL = "No Host email is set. Add it in Settings.";

export function errorText(e: unknown): string {
  const m = e instanceof Error ? e.message : "";
  if (!m) return "Something went wrong";
  const code = /^Server answered (\d+)$/.exec(m);
  if (code) return `The server had a problem (error ${code[1]})`;
  return m;
}

/** Runs one action at a time for one view: busy label, result line, error. */
export function useAction(after?: () => void | Promise<void>) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  /** label is what is happening ("Finding this week's topics"), failed is what could not be done ("Could not find this week's topics"). */
  const run = useCallback(
    async (label: string, fn: () => Promise<ActionResult | string | void>, failed?: string) => {
      setBusy(label);
      setError(null);
      setMessage(null);
      setDetail(null);
      try {
        const r = await fn();
        const raw = typeof r === "string" ? r : r ? r.log : "";
        const plain = raw ? plainLogLine(raw) : "Done";
        setMessage(plain);
        setDetail(raw && plain !== raw ? raw : null);
        await after?.();
      } catch (e) {
        setError(`${failed ?? "That did not work"}: ${errorText(e).replace(/[.\s]+$/, "")}.`);
      } finally {
        setBusy(null);
      }
    },
    [after],
  );

  /** Shows a plain result and clears any earlier detail or error. */
  const say = useCallback((m: string) => {
    setMessage(m);
    setDetail(null);
    setError(null);
  }, []);

  /** Shows a refusal, for example a missing address, without running anything. */
  const fail = useCallback((m: string) => {
    setMessage(null);
    setDetail(null);
    setError(m);
  }, []);

  return { busy, message, detail, error, run, setMessage, say, fail };
}

export type Resource<T> = {
  data: T | undefined;
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
  set: (v: T) => void;
};

/** Loads once on mount, and again on reload(). The fetcher must be stable. */
export function useResource<T>(fetcher: () => Promise<T>): Resource<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const v = await fetcher();
      setData(v);
      setError(null);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    let live = true;
    fetcher().then(
      (v) => {
        if (!live) return;
        setData(v);
        setError(null);
        setLoading(false);
      },
      (e) => {
        if (!live) return;
        setError(errorText(e));
        setLoading(false);
      },
    );
    return () => {
      live = false;
    };
  }, [fetcher]);

  return { data, error, loading, reload, set: setData };
}
