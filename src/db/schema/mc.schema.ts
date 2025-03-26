import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { user } from "./user.schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const mc = table(
  "mc",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.MC),
    name: t.varchar("name"),
    user_id: t.integer("user_id").references(() => user.id),
    ...timestamps,
  },
  (table) => [t.index("mc_name_idx").on(table.name)]
);

export const selectMcSchema = createSelectSchema(mc)
  .merge(
    z.object({
      user_uid: z.string().startsWith(PREFIX.USER).nullable(),
    })
  )
  .omit({ id: true, user_id: true, deleted_at: true });

export const insertMcSchema = createInsertSchema(mc, {
  name: (schema) => schema.min(1),
})
  .merge(
    z.object({
      user_uid: z.string().startsWith(PREFIX.USER).nullable(),
    })
  )
  .omit({
    uid: true,
    user_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchMcSchema = createUpdateSchema(mc, {
  name: (schema) => schema.min(1),
})
  .merge(
    z.object({
      user_uid: z.string().startsWith(PREFIX.USER).optional(),
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
