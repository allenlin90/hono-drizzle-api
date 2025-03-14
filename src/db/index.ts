import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import env from "@/env";
import * as schema from "./schema";

const db = drizzle({
  casing: "snake_case",
  connection: {
    connectionString: env.DATABASE_URL,
  },
  logger: true,
  schema,
});

export type DB = typeof db;

export default db;
