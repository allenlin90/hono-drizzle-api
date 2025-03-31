import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { isNull } from "drizzle-orm";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { user } from "./user.schema";

export const operator = table(
  "operator",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.OPERATOR),
    name: t.varchar("name").notNull(),
    user_id: t.integer("user_id").references(() => user.id),
    ...timestamps,
  },
  (table) => [
    t.index("operator_name_idx").on(table.name).where(isNull(table.deleted_at)),
    t
      .index("operator_user_id_idx")
      .on(table.user_id)
      .where(isNull(table.deleted_at)),
  ]
);

export const selectOperatorSchema = createSelectSchema(operator)
  .merge(
    z.object({
      user_uid: z.string().startsWith(PREFIX.USER).nullable(),
    })
  )
  .omit({ id: true, user_id: true, deleted_at: true });

export const insertOperatorSchema = createInsertSchema(operator)
  .merge(
    z.object({
      name: z.string().min(1),
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

export const patchOperatorSchema = createUpdateSchema(operator)
  .merge(
    z.object({
      name: z.string().min(1).optional(),
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

export type SelectOperatorSchema = z.infer<typeof selectOperatorSchema>;
export type InsertOperatorSchema = z.infer<typeof insertOperatorSchema>;
export type PatchOperatorSchema = z.infer<typeof patchOperatorSchema>;
