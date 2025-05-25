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
import { showMc } from "./show-mc.schema";
import { material } from "./material.schema";

export const showMcMaterial = table(
  "show_mc_material",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.SHOW_MC_MATERIAL),
    show_mc_id: t.integer("show_mc_id").references(() => showMc.id).notNull(),
    material_id: t.integer("material_id").references(() => material.id).notNull(),
    is_active: t.boolean("is_active").default(true).notNull(),
    note: t.varchar("note"),
    ...timestamps,
  },
  (table) => [
    t.unique().on(table.show_mc_id, table.material_id),
    t
      .index()
      .on(table.show_mc_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.show_mc_id, table.material_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.material_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.material_id, table.is_active)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.note)
      .where(isNull(table.deleted_at)),
    t
      .index("show_mc_material_note_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.note})`),
  ]
);

export const selectShowMcMaterialSchema = createSelectSchema(showMcMaterial)
  .merge(
    z.object({
      show_mc_id: z.string().startsWith(PREFIX.SHOW_MC),
      material_id: z.string().startsWith(PREFIX.MATERIAL),
    })
  )
  .omit({
    id: true,
    show_mc_id: true,
    material_id: true,
    deleted_at: true,
  });

export const insertShowMcMaterialSchema = createInsertSchema(showMcMaterial)
  .merge(
    z.object({
      name: z.string().min(1),
      show_mc_id: z.string().startsWith(PREFIX.SHOW_MC),
      material_id: z.string().startsWith(PREFIX.MATERIAL),
      is_active: z.boolean().default(true).optional(),
      note: z.string().min(1).optional(),
    })
  )
  .omit({
    uid: true,
    show_mc_id: true,
    material_id: true,
    deleted_at: true,
  });

export const patchShowMcMaterialSchema = createUpdateSchema(showMcMaterial)
  .merge(
    z.object({
      name: z.string().min(1).optional(),
      show_mc_id: z.string().startsWith(PREFIX.SHOW_MC).optional(),
      material_id: z.string().startsWith(PREFIX.MATERIAL).optional(),
      is_active: z.boolean().default(true).optional(),
      note: z.string().min(1).optional(),
    })
  )
  .omit({
    uid: true,
    show_mc_id: true,
    material_id: true,
    deleted_at: true,
  });

export const patchBulkShowMcMaterialSchema = createUpdateSchema(showMcMaterial)
  .merge(
    z.object({
      name: z.string().min(1).optional(),
      show_mc_id: z.string().startsWith(PREFIX.SHOW_MC).optional(),
      material_id: z.string().startsWith(PREFIX.MATERIAL).optional(),
      note: z.string().min(1).optional(),
    })
  )
  .omit({
    uid: true,
    show_mc_id: true,
    material_id: true,
    deleted_at: true,
  });

export type SelectShowMcMaterialSchema = z.infer<typeof selectShowMcMaterialSchema>;
export type InsertShowMcMaterialSchema = z.infer<typeof insertShowMcMaterialSchema>;
export type PatchShowMcMaterialSchema = z.infer<typeof patchShowMcMaterialSchema>;
export type PatchBulkShowMcMaterialSchema = z.infer<typeof patchBulkShowMcMaterialSchema>;
