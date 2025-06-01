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

export const rankingTypeEnum = t.pgEnum("ranking_type", [
  "normal",
  "good",
  "superstar",
]);

export const mc = table(
  "mc",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.MC),
    banned: t.boolean().default(false).notNull(),
    email: t.varchar("email", { length: 255 }).unique(),
    ext_id: t.varchar("ext_id").unique(),
    metadata: t.jsonb("metadata").default({}).notNull(),
    name: t.varchar("name").notNull(),
    ranking: rankingTypeEnum().notNull(),
    ...timestamps,
  },
  (table) => [
    t.index().on(table.email).where(isNull(table.deleted_at)),
    t.index().on(table.ext_id).where(isNull(table.deleted_at)),
    t.index().on(table.name).where(isNull(table.deleted_at)),
    t.index().on(table.name, table.banned).where(isNull(table.deleted_at)),
    t.index().on(table.ranking).where(isNull(table.deleted_at)),
    t
      .index("mc_name_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.name})`),
  ]
);

export const selectMcSchema = createSelectSchema(mc)
  .omit({ id: true, deleted_at: true });

export const insertMcSchema = createInsertSchema(mc)
  .omit({
    uid: true,
    banned: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchMcSchema = createUpdateSchema(mc)
  .merge(
    z.object({
      name: z.string().min(1).optional(),
    })
  )
  .omit({
    uid: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export type SelectMcSchema = z.infer<typeof selectMcSchema>;
export type InsertMcSchema = z.infer<typeof insertMcSchema>;
export type PatchMcSchema = z.infer<typeof patchMcSchema>;
