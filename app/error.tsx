"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" tabIndex={-1} className="shell flex min-h-[70vh] flex-col justify-center py-24">
      <p className="t-label text-primary">Error</p>
      <h1 className="t-headline mt-6 max-w-[18ch] text-balance text-on-surface">
        This page did not load.
      </h1>
      <p className="t-body mt-6 max-w-[50ch] text-pretty text-on-surface-variant">
        Something went wrong on our side. Reloading fixes most of these.
      </p>
      {error.digest ? (
        <p className="t-value mt-5 text-on-surface-muted">Reference {error.digest}</p>
      ) : null}
      <div className="mt-10">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-[52px] items-center rounded-[var(--radius-sm)] bg-cta px-7 t-title text-[16px] text-on-cta transition-colors duration-100 ease-[var(--ease-standard)] hover:bg-on-surface"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
