/* Creates the admin account and prints a generated password once.
 *
 * Run:  npm run seed:admin
 *
 * The password is generated here and printed only to your terminal, so it is
 * never stored in readable form. Sign in with it, set up social login and 2FA,
 * then password auth gets switched off entirely.
 */
import { randomBytes } from "node:crypto";
import { auth, ADMIN_USERNAME } from "../lib/auth";
import { pool } from "../lib/db";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Put it in .env.local first.");
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL ?? `${ADMIN_USERNAME}@eterneon.local`;

  const existing = await pool.query('select id from "user" where username = $1', [
    ADMIN_USERNAME,
  ]);

  if (existing.rowCount) {
    console.log(`\n  "${ADMIN_USERNAME}" already exists - nothing to do.`);
    console.log("  To start over, delete that row and run this again.\n");
    return;
  }

  /* 24 chars of base64url from 18 random bytes. */
  const password = randomBytes(18).toString("base64url");

  await auth.api.signUpEmail({
    body: { email, password, name: "EternalHell", username: ADMIN_USERNAME },
  });

  console.log(`
  Admin account created.

    username   ${ADMIN_USERNAME}
    password   ${password}
    email      ${email}

  Copy the password now - this is the only time it is shown.
  Sign in at http://localhost:3000/panel/login
`);
}

main()
  .catch((error) => {
    console.error("seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
