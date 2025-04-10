import { isNull, sql } from "drizzle-orm";
import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

export const brand = table(
  "brand",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.BRAND),
    name: t.varchar("name").unique().notNull(),
    ...timestamps,
  },
  (table) => [
    t.index("brand_name_idx").on(table.name).where(isNull(table.deleted_at)),
    t
      .index("brand_name_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.name})`),
  ]
);

export const selectBrandSchema = createSelectSchema(brand).omit({
  id: true,
  deleted_at: true,
});

export const insertBrandSchema = createInsertSchema(brand, {
  name: (schema) => schema.min(1),
}).omit({
  uid: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const patchBrandSchema = createUpdateSchema(brand, {
  name: (schema) => schema.min(1),
}).omit({
  uid: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export type SelectBrandSchema = z.infer<typeof selectBrandSchema>;
