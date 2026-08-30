import { Pool } from "pg";

/* One pool per process. Next reloads modules in dev, so it is cached on
   globalThis to avoid opening a new pool on every hot reload. */
const globalForDb = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export async function query<T>(text: string, values: unknown[] = []): Promise<T[]> {
  const result = await pool.query(text, values);
  return result.rows as T[];
}
