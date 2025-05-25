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

export const memberTypeEnum = t.pgEnum("member_type", [
  "helper",
  "moderator",
  "operator",
  "manager",
  "admin",
]);

export const member = table(
  "member",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.MEMBER),
    banned: t.boolean(),
    email: t.varchar("email", { length: 255 }).unique(),
    ext_id: t.integer("ext_id").unique(),
    metadata: t.jsonb("metadata").default({}).notNull(),
    name: t.varchar("name"),
    type: memberTypeEnum().notNull(),
    ...timestamps,
  },
  (table) => [
    t.index().on(table.email).where(isNull(table.deleted_at)),
    t.index().on(table.ext_id).where(isNull(table.deleted_at)),
    t.index().on(table.name).where(isNull(table.deleted_at)),
    t.index().on(table.name, table.banned).where(isNull(table.deleted_at)),
    t.index().on(table.type).where(isNull(table.deleted_at)),
    t.index().on(table.type, table.banned).where(isNull(table.deleted_at)),
    t
      .index("member_name_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.name})`),
  ]
);

export const selectMemberSchema = createSelectSchema(member)
  .omit({ id: true, deleted_at: true });

export const insertMemberSchema = createInsertSchema(member)
  .merge(
    z.object({
      email: z.string().email().optional(),
      name: z.string().min(1),
      type: z.enum(memberTypeEnum.enumValues),
    })
  )
  .omit({
    uid: true,
    banned: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchMemberSchema = createUpdateSchema(member)
  .merge(
    z.object({
      email: z.string().min(1).optional(),
      ext_id: z.string().min(1).optional(),
      name: z.string().min(1).optional(),
      metadata: z.any({}).optional(),
      type: z.enum(memberTypeEnum.enumValues).optional(),
    })
  )
  .omit({
    uid: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export type SelectMemberSchema = z.infer<typeof selectMemberSchema>;
export type InsertMemberSchema = z.infer<typeof insertMemberSchema>;
export type PatchMemberSchema = z.infer<typeof patchMemberSchema>;
