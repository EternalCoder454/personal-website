import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { QuickScriptConsole } from "@/components/quickscript-console";
import { hasQuickScriptSession } from "@/lib/quickscript/auth";

export const metadata: Metadata = {
  title: { absolute: "QuickScript" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
};

export default async function QuickScriptPage() {
  /* The proxy already turns away anyone without a session. This is the
     second lock, on the page itself, so the console never renders on the
     strength of one check that matched a path. */
  if (!(await hasQuickScriptSession())) redirect("/quickscript/login");
  return (
    <Suspense fallback={<p className="py-6 text-on-surface-variant">Loading</p>}>
      <QuickScriptConsole />
    </Suspense>
  );
}
