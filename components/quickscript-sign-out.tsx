"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Ends the QuickScript session and returns to the sign-in screen. */
export function QuickScriptSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/quickscript/logout", { method: "POST" }).catch(() => undefined);
        router.replace("/quickscript/login");
        router.refresh();
      }}
      className="shrink-0 text-sm text-on-surface-variant underline underline-offset-4 hover:text-on-surface disabled:opacity-60"
    >
      Sign out
    </button>
  );
}
