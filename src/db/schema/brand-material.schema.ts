import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";
import { isNull, sql } from "drizzle-orm";

import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { brand } from "./brand.schema";
import { PREFIX } from "@/constants";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const materialTypeEnum = t.pgEnum("material_type", [
  "mechanic",
  "scene",
  "script",
  "other",
]);

export const brandMaterial = table(
  "brand_material",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.MATERIAL),
    brand_id: t
      .integer("brand_id")
      .references(() => brand.id)
      .notNull(),
    type: materialTypeEnum().notNull(),
    name: t.varchar("name").notNull(),
    description: t.text("description"),
    is_active: t.boolean("is_active").default(true).notNull(),
    resource_url: t.varchar("resource_url"),
    ...timestamps,
  },
  (table) => [
    t.unique().on(table.brand_id, table.name),
    t.index("brand_id_idx").on(table.id).where(isNull(table.deleted_at)),
    t
      .index("brand_material_name_idx")
      .on(table.name)
      .where(isNull(table.deleted_at)),
    t
      .index("brand_material_resource_url_idx")
      .on(table.resource_url)
      .where(isNull(table.deleted_at)),
    t
      .index("brand_material_name_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.name})`),
  ]
);

export const selectBrandMaterialSchema = createSelectSchema(brandMaterial)
  .merge(z.object({ brand_uid: z.string() }))
  .omit({
    id: true,
    brand_id: true,
    deleted_at: true,
  });

export const insertBrandMaterialSchema = createInsertSchema(brandMaterial)
  .merge(
    z.object({
      brand_uid: z.string(),
      name: z.string().min(1),
      type: z.enum(materialTypeEnum.enumValues),
      description: z.string().min(1).optional(),
      resource_url: z.string().url().optional(),
    })
  )
  .omit({
    uid: true,
    brand_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchBrandMaterialSchema = createUpdateSchema(brandMaterial)
  .merge(
    z.object({
      brand_uid: z.string().startsWith(PREFIX.BRAND).optional(),
      name: z.string().min(1).optional(),
      type: z.enum(materialTypeEnum.enumValues).optional(),
      description: z.string().min(1).optional(),
      resource_url: z.string().url().optional(),
    })
  )
  .omit({
    uid: true,
    brand_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const brandMaterialTypeEnum = createSelectSchema(materialTypeEnum);

export type SelectBrandMaterialSchema = z.infer<
  typeof selectBrandMaterialSchema
>;
export type InsertBrandMaterialSchema = z.infer<
  typeof insertBrandMaterialSchema
>;
export type PatchShowSchema = z.infer<typeof patchBrandMaterialSchema>;
