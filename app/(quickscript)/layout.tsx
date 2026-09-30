import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { QuickScriptSignOut } from "@/components/quickscript-sign-out";
import { hasQuickScriptSession } from "@/lib/quickscript/auth";

/**
 * QuickScript, the maintainer console. A route group of its own: no site
 * header or footer, no company theme, no Newsreader. It uses the base dark
 * tokens, and nothing links here. Its type is the Muster panel's, IBM Plex
 * Sans and Plex Mono with the same weights, loaded here so only these pages
 * request it.
 */
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-qs-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap", variable: "--font-qs-mono" });

export default async function QuickScriptLayout({ children }: { children: React.ReactNode }) {
  const sample = process.env.NEXT_PUBLIC_QUICKSCRIPT_LIVE !== "1";
  const signedIn = await hasQuickScriptSession();
  return (
    <div
      className={`${sans.variable} ${mono.variable} min-h-dvh font-sans [text-rendering:geometricPrecision] [--font-mono:var(--font-qs-mono),ui-monospace,monospace] [--font-sans:var(--font-qs-sans),ui-sans-serif,system-ui,sans-serif] [&_code]:font-mono [&_kbd]:font-mono [&_pre]:font-mono [&_samp]:font-mono`}
    >
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
