import { headers } from "next/headers";
import { auth, ADMIN_USERNAME } from "./auth";

/* Server actions are public HTTP endpoints. Having a guarded page is not
   enough - every action re-checks this for itself. */
export async function getAdmin() {
  let session;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    /* An unreachable database means "not signed in", not a crashed page. */
    console.error("auth: session lookup failed", error);
    return null;
  }
  if (!session) return null;

  const name = (session.user as { username?: string | null }).username;
  return name === ADMIN_USERNAME ? session : null;
}

export async function requireAdmin() {
  const session = await getAdmin();
  if (!session) throw new Error("Not authorised");
  return session;
}
