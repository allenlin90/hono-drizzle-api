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
import { user } from "./user.schema";

export const mc = table(
  "mc",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.MC),
    name: t.varchar("name"),
    user_id: t.integer("user_id").references(() => user.id),
    banned: t.boolean(),
    ...timestamps,
  },
  (table) => [
    t.unique().on(table.user_id),
    t.index("mc_name_idx").on(table.name).where(isNull(table.deleted_at)),
    t.index("mc_user_id_idx").on(table.user_id).where(isNull(table.deleted_at)),
    t
      .index("mc_name_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.name})`),
  ]
);

export const selectMcSchema = createSelectSchema(mc)
  .merge(
    z.object({
      user_uid: z.string().startsWith(PREFIX.USER).nullable(),
    })
  )
  .omit({ id: true, user_id: true, deleted_at: true });

export const insertMcSchema = createInsertSchema(mc)
  .merge(
    z.object({
      name: z.string().min(1),
      user_uid: z.string().startsWith(PREFIX.USER).nullable(),
    })
  )
  .omit({
    uid: true,
    user_id: true,
    banned: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchMcSchema = createUpdateSchema(mc)
  .merge(
    z.object({
      name: z.string().min(1).optional(),
      user_uid: z.string().startsWith(PREFIX.USER).nullable().optional(),
    })
  )
  .omit({
    uid: true,
    user_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export type SelectMcSchema = z.infer<typeof selectMcSchema>;
export type InsertMcSchema = z.infer<typeof insertMcSchema>;
export type PatchMcSchema = z.infer<typeof patchMcSchema>;
