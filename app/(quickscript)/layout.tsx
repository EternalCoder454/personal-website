import Link from "next/link";
import { QuickScriptSignOut } from "@/components/quickscript-sign-out";
import { hasQuickScriptSession } from "@/lib/quickscript/auth";

/**
 * QuickScript, the maintainer console. A route group of its own: no site
 * header or footer, no company theme, no Newsreader. It uses the base dark
 * tokens and Geist from the root layout, and nothing links here.
 */
export default async function QuickScriptLayout({ children }: { children: React.ReactNode }) {
  const sample = process.env.NEXT_PUBLIC_QUICKSCRIPT_LIVE !== "1";
  const signedIn = await hasQuickScriptSession();
  return (
    <div className="min-h-dvh">
      <header className="border-b border-outline-variant">
        <div className="shell flex h-12 items-center justify-between gap-3">
          <p className="flex min-w-0 items-baseline gap-3">
            <span className="font-medium">QuickScript</span>
            {sample && <span className="truncate text-sm text-on-surface-variant">Sample data</span>}
          </p>
          <div className="flex shrink-0 items-center gap-4">
            {signedIn && <QuickScriptSignOut />}
            <Link href="/" className="shrink-0 text-sm text-on-surface-variant underline underline-offset-4 hover:text-on-surface">
              eterneon.net
            </Link>
          </div>
        </div>
      </header>
      <main id="main" className="shell py-5 pb-16">
        {children}
      </main>
    </div>
  );
}
