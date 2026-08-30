/* Creates the content tables and seeds the skills on first run.
   Safe to run repeatedly. */
import { readFile } from "node:fs/promises";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Put it in .env.local first.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");

await pool.query(schema);
console.log("content tables ready");

const { rows } = await pool.query("select count(*)::int as n from skill");
if (rows[0].n === 0) {
  const seed = [
    ["Pixel Artist", 1, "grid_on", 0],
    ["Minecraft Builder", 4, "castle", 1],
    ["Leadership", 2, "groups", 2],
  ];
  for (const [name, level, icon, position] of seed) {
    await pool.query(
      "insert into skill (name, level, icon, position) values ($1, $2, $3, $4)",
      [name, level, icon, position]
    );
  }
  console.log(`seeded ${seed.length} skills`);
} else {
  console.log(`skills already present (${rows[0].n}), left alone`);
}

await pool.end();
