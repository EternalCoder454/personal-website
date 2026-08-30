/* Runs Better Auth's migrations using the installed version of the library.
 *
 * The standalone @better-auth/cli lags behind better-auth itself, and a
 * mismatch silently produces a schema missing columns the library expects.
 * Going through getMigrations keeps the two in lockstep.
 */
import { getMigrations } from "better-auth/db/migration";
import { auth } from "../lib/auth";
import { pool } from "../lib/db";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Put it in .env.local first.");
    process.exit(1);
  }

  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options);

  const created = toBeCreated.map((t) => t.table);
  const added = toBeAdded.map((t) => `${t.table} (+${Object.keys(t.fields).length})`);

  if (!created.length && !added.length) {
    console.log("auth schema already up to date");
    return;
  }

  if (created.length) console.log("creating tables:", created.join(", "));
  if (added.length) console.log("adding columns to:", added.join(", "));

  await runMigrations();
  console.log("auth migration complete");
}

main()
  .catch((error) => {
    console.error("auth migration failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
