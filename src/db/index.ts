import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import env from "@/env";
import * as schema from "./schema";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_MIGRATING || env.DB_SEEDING ? 1 : undefined,
});

export const db = drizzle({
  casing: "snake_case",
  client: pool,
  logger: true,
  schema,
});

export type DB = typeof db;

export default db;
