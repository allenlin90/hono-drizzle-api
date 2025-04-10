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
import { address } from "./address.schema";

export const studio = table(
  "studio",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.STUDIO),
    name: t.varchar("name").unique().notNull(),
    address_id: t.integer("address_id").references(() => address.id),
    ...timestamps,
  },
  (table) => [
    t.index("studio_name_idx").on(table.name).where(isNull(table.deleted_at)),
    t
      .index("studio_address_id_idx")
      .on(table.address_id)
      .where(isNull(table.deleted_at)),
    t
      .index("studio_name_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.name})`),
  ]
);

export const selectStudioSchema = createSelectSchema(studio)
  .merge(
    z.object({
      address_uid: z.string().startsWith(PREFIX.ADDRESS).nullable(),
    })
  )
  .omit({
    id: true,
    address_id: true,
    deleted_at: true,
  });

export const insertStudioSchema = createInsertSchema(studio)
  .merge(
    z.object({
      name: z.string().min(1),
      address_uid: z.string().startsWith(PREFIX.ADDRESS).nullable(),
    })
  )
  .omit({
    uid: true,
    address_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchStudioSchema = createUpdateSchema(studio)
  .merge(
    z.object({
      name: z.string().min(1),
      address_uid: z.string().startsWith(PREFIX.ADDRESS),
    })
  )
  .omit({
    uid: true,
    address_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export type SelectStudioSchema = z.infer<typeof selectStudioSchema>;
export type InsertStudioSchema = z.infer<typeof insertStudioSchema>;
export type PatchStudioSchema = z.infer<typeof patchStudioSchema>;
