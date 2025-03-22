import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "@hono/zod-openapi";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

export const brand = table("brand", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: brandedUid(PREFIX.BRAND),
  name: t.varchar("name").unique().notNull(),
  ...timestamps,
});

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
