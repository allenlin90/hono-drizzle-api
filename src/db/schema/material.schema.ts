import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";
import { isNull, sql } from "drizzle-orm";

import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { client } from "./client.schema";
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

export const material = table(
  "material",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.MATERIAL),
    client_id: t
      .integer("client_id")
      .references(() => client.id),
    type: materialTypeEnum().notNull(),
    name: t.varchar("name").notNull(),
    description: t.text("description"),
    is_active: t.boolean("is_active").default(true).notNull(),
    resource_url: t.varchar("resource_url").unique(),
    ...timestamps,
  },
  (table) => [
    t
      .index()
      .on(table.name)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.client_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.client_id, table.type)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.type)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.type, table.is_active)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.client_id, table.is_active)
      .where(isNull(table.deleted_at)),
    t
      .index("material_name_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.name})`),
    t
      .index("material_description_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.description})`),
  ]
);

export const selectMaterialSchema = createSelectSchema(material)
  .merge(z.object({ client_uid: z.string() }))
  .omit({
    id: true,
    client_id: true,
    deleted_at: true,
  });

export const insertMaterialSchema = createInsertSchema(material)
  .merge(
    z.object({
      client_uid: z.string().optional(),
      name: z.string().min(1),
      type: z.enum(materialTypeEnum.enumValues),
      description: z.string().min(1).optional(),
      resource_url: z.string().url().optional(),
    })
  )
  .omit({
    uid: true,
    client_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchMaterialSchema = createUpdateSchema(material)
  .merge(
    z.object({
      client_uid: z.string().startsWith(PREFIX.CLIENT).optional(),
      name: z.string().min(1).optional(),
      type: z.enum(materialTypeEnum.enumValues).optional(),
      description: z.string().min(1).optional(),
      resource_url: z.string().url().optional(),
    })
  )
  .omit({
    uid: true,
    client_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const brandMaterialTypeEnum = createSelectSchema(materialTypeEnum);

export type SelectMaterialSchema = z.infer<
  typeof selectMaterialSchema
>;
export type InsertMaterialSchema = z.infer<
  typeof insertMaterialSchema
>;
export type PatchMaterialSchema = z.infer<typeof patchMaterialSchema>;
