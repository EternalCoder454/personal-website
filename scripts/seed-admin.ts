/* Creates the admin account and prints a generated password once.
 *
 * Run:  npm run seed:admin
 *
 * The password is generated here and shown only in your terminal, so it never
 * ends up in a chat log or in git. Sign in with it, set up social login and
 * 2FA, then password auth gets switched off entirely.
 */
import { randomBytes } from "node:crypto";
import { auth, ADMIN_USERNAME } from "../lib/auth";
import { pool } from "../lib/db";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Put it in .env.local first.");
  process.exit(1);
}

const email = process.env.ADMIN_EMAIL ?? `${ADMIN_USERNAME}@eterneon.local`;

const existing = await pool.query("select id from \"user\" where username = $1", [
  ADMIN_USERNAME,
]);

if (existing.rowCount) {
  console.log(`\n  "${ADMIN_USERNAME}" already exists - nothing to do.`);
  console.log("  To start over, delete the row and run this again.\n");
  await pool.end();
  process.exit(0);
}

/* 24 chars of base64url from 18 random bytes. */
const password = randomBytes(18).toString("base64url");

await auth.api.signUpEmail({
  body: {
    email,
    password,
    name: "EternalHell",
    username: ADMIN_USERNAME,
  },
});

console.log(`
  Admin account created.

    username   ${ADMIN_USERNAME}
    password   ${password}
    email      ${email}

  Copy the password now - it is not stored anywhere in readable form and
  this is the only time it is shown. Sign in at /panel/login.
`);

await pool.end();
