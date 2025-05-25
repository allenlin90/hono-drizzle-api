import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

export const city = table(
  "city",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.CITY),
    name: t.varchar("name").unique().notNull(),
    ...timestamps,
  },
  (table) => [
    t
      .index("city_name_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.name})`),
  ]
);

export const selectCitySchema = createSelectSchema(city).omit({
  id: true,
  deleted_at: true,
});

export const insertCitySchema = createInsertSchema(city, {
  name: z.string().min(1),
}).omit({
  uid: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const patchCitySchema = createInsertSchema(city, {
  name: z.string().min(1),
}).omit({
  uid: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export type SelectCitySchema = z.infer<typeof selectCitySchema>;
export type InsertCitySchema = z.infer<typeof insertCitySchema>;
export type PatchCitySchema = z.infer<typeof patchCitySchema>;
