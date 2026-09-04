import type { ReactNode } from "react";
import { Wordmark } from "@/components/wordmark";

/**
 * The shared shell for the legal pages.
 *
 * These are the two pages allowed to have links, because a privacy
 * notice you cannot reach is not a privacy notice. They stay narrow,
 * quiet and text-only.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main id="main" tabIndex={-1} className="shell py-14 md:py-20">
      <Wordmark />

      <h1 className="t-headline mt-16 text-on-surface">{title}</h1>
      <p className="t-body-sm mt-4 text-on-surface-muted">Last updated {updated}</p>

      <div className="mt-14 max-w-[68ch] border-t border-outline-variant pt-10">{children}</div>
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="t-title text-[19px] text-on-surface">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Para({ children }: { children: ReactNode }) {
  return (
    <p className="t-body mt-4 text-pretty text-on-surface-variant first:mt-0">{children}</p>
  );
}

