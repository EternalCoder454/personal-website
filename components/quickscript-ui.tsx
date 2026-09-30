"use client";

import { useCallback, useEffect, useState } from "react";
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

export function Panel({
  title,
  actions,
  children,
  className = "",
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-outline-variant bg-surface-low p-4 sm:p-5 ${className}`}>
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
    <label className={`flex flex-col gap-1.5 text-sm text-on-surface-variant ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 border border-error/60 bg-error-container px-3 py-2 text-sm text-error"
    >
      <span>{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="underline underline-offset-4">
          Retry
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
export function ActionStatus({ busy, message, error }: { busy: string | null; message: string | null; error: string | null }) {
  return (
    <div className="min-h-6 text-sm">
      <div role="status" aria-live="polite" className="text-on-surface-variant">
        {busy ? `${busy}, working` : message}
      </div>
      {error && <InlineError message={error} />}
    </div>
  );
}

export function errorText(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}

/** Runs one action at a time for one view: busy label, result line, error. */
export function useAction(after?: () => void | Promise<void>) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (label: string, fn: () => Promise<ActionResult | string | void>) => {
      setBusy(label);
      setError(null);
      setMessage(null);
      try {
        const r = await fn();
        setMessage(typeof r === "string" ? r : r ? r.log : `${label}, done`);
        await after?.();
      } catch (e) {
        setError(errorText(e));
      } finally {
        setBusy(null);
      }
    },
    [after],
  );

  return { busy, message, error, run, setMessage };
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
