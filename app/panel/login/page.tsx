import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/panel/LoginForm";
import { getAdmin } from "@/lib/guard";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getAdmin()) redirect("/panel");

  const social = {
    github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    discord: Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
  };

  return (
    <main className="content">
      <LoginForm social={social} />
    </main>
  );
}
