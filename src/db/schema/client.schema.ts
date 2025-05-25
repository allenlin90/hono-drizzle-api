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

export const client = table(
  "client",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.CLIENT),
    name: t.varchar("name").unique().notNull(),
    ...timestamps,
  },
  (table) => [
    t
      .index()
      .on(table.name)
      .where(isNull(table.deleted_at)),
    t
      .index("client_name_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.name})`),
  ]
);

export const selectClientSchema = createSelectSchema(client).omit({
  id: true,
  deleted_at: true,
});

export const insertClientSchema = createInsertSchema(client, {
  name: (schema) => schema.min(1),
}).omit({
  uid: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const patchClientSchema = createUpdateSchema(client, {
  name: (schema) => schema.min(1),
}).omit({
  uid: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export type SelectClientSchema = z.infer<typeof selectClientSchema>;
export type InsertClientSchema = z.infer<typeof insertClientSchema>;
export type PatchClientSchema = z.infer<typeof patchClientSchema>;
