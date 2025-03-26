import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "@hono/zod-openapi";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { brand } from "./brand.schema";

export const show = table(
  "show",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.SHOW),
    name: t.varchar("name").notNull(),
    brand_id: t
      .integer("brand_id")
      .references(() => brand.id)
      .notNull(),
    start_time: t.timestamp("start_time", { mode: "string" }).notNull(),
    end_time: t.timestamp("end_time", { mode: "string" }).notNull(),
    ...timestamps,
  },
  (table) => [t.index("show_name_idx").on(table.name)]
);

export const selectShowSchema = createSelectSchema(show)
  .merge(
    z.object({
      brand_uid: z.string(),
    })
  )
  .omit({
    id: true,
    brand_id: true,
    deleted_at: true,
  });

export const insertShowSchema = createInsertSchema(show)
  .merge(z.object({ brand_uid: z.string().startsWith(PREFIX.BRAND) }))
  .omit({
    uid: true,
    brand_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchShowSchema = createUpdateSchema(show, {
  name: (schema) => schema.min(1).optional(),
  start_time: (schema) => schema.datetime().optional(),
  end_time: (schema) => schema.datetime().optional(),
})
  .merge(
    z.object({
      brand_uid: z.string().startsWith(PREFIX.BRAND).optional(),
    })
  )
  .omit({
    uid: true,
    brand_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export type SelectShowSchema = z.infer<typeof selectShowSchema>;
export type InsertShowSchema = z.infer<typeof insertShowSchema>;
export type PatchShowSchema = z.infer<typeof patchShowSchema>;
