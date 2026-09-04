import type { Metadata } from "next";
import Link from "next/link";

/* Inherited alternates.canonical "/" and robots index:true from the
   layout, so the 404 declared itself the canonical home page and asked
   to be indexed. */
export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="shell flex min-h-[80vh] max-w-[var(--measure)] flex-col justify-center py-24">
      <p className="t-label text-primary">404</p>
      <h1 className="t-headline mt-6 max-w-[18ch] text-balance text-on-surface">
        There is nothing at this address.
      </h1>
      <p className="t-body mt-6 max-w-[50ch] text-pretty text-on-surface-variant">
        Eterneon is one page, and everything on it is at the address below.
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex min-h-[52px] items-center rounded-[var(--radius-sm)] bg-cta px-7 t-title text-[16px] text-on-cta transition-colors duration-100 ease-[var(--ease-standard)] hover:bg-on-surface"
        >
          Back to the start
        </Link>
      </div>
    </main>
  );
}
