import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await getAdmin())) redirect("/panel/login");
  return children;
}
