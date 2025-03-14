import { type Table, getTableName, sql } from "drizzle-orm";
import env from "@/env";
import { db, pool as connection } from "@/db";
import * as schema from "@/db/schema";
// import * as seeds from "./seeds";

if (!env.DB_SEEDING) {
  throw new Error('You must set DB_SEEDING to "true" when running seeds');
}

async function resetTable(db: db, table: Table) {
  return db.execute(
    sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`)
  );
}

for (const table of [
  schema.address,
  schema.brand,
  schema.city,
  schema.mcShowReview,
  schema.mc,
  schema.operator,
  schema.platform,
  schema.showMaterial,
  schema.showPlatformMaterial,
  schema.showPlatformMc,
  schema.showPlatformReview,
  schema.showPlatform,
  schema.show,
  schema.studioRoom,
  schema.studio,
  schema.task,
  schema.user,
]) {
  // await db.delete(table); // clear tables without truncating / resetting ids
  await resetTable(db, table);
}

// TODO: seeding to db
// await seeds.brand(db);

await connection.end();
