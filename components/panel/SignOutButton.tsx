"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <button
      className="button button--tonal"
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.push("/panel/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
