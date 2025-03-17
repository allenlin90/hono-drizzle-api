import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

export const brand = table("brand", {
  id: t.serial("id").primaryKey(),
  uid: brandedUid(PREFIX.BRAND),
  name: t.varchar("name").unique().notNull(),
  ...timestamps,
});

export const selectBrandsSchema = createSelectSchema(brand).omit({
  id: true,
  deletedAt: true,
});

export const insertBrandSchema = createInsertSchema(brand, {
  name: (schema) => schema.min(1).max(255),
}).omit({
  id: true,
  uid: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const patchBrandSchema = createUpdateSchema(brand, {
  name: (schema) => schema.min(1).max(255),
}).omit({
  id: true,
  uid: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
