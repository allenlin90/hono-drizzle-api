import env from "@/env";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { reset, seed } from "drizzle-seed";

if (!env.DB_SEEDING) {
  throw new Error('You must set DB_SEEDING to "true" when running seeds');
}

const tables = {
  address: schema.address,
  brand: schema.brand,
  city: schema.city,
  mcShowReview: schema.mcShowReview,
  mc: schema.mc,
  operator: schema.operator,
  platform: schema.platform,
  brandMaterial: schema.brandMaterial,
  showPlatformMaterial: schema.showPlatformMaterial,
  showPlatformMc: schema.showPlatformMc,
  showPlatformReview: schema.showPlatformReview,
  showPlatform: schema.showPlatform,
  show: schema.show,
  studioRoom: schema.studioRoom,
  studio: schema.studio,
  task: schema.task,
  user: schema.user,
};

await reset(db, tables);
await seed(db, tables);

for (const table of Object.values(tables)) {
  await db.update(table).set({ deletedAt: null });
}

console.log("seeding completes");
db.$client.end();
