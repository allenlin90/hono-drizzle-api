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
import { brandedUid, reviewByMember, timestamps } from "../helpers/columns.helpers";
import { show } from "./show.schema";
import { platform } from "./platform.schema";

export const showPlatform = table(
  "show_platform",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.SHOW_PLATFORM),
    show_id: t.integer("show_id").references(() => show.id).notNull(),
    platform_id: t.integer("platform_id").references(() => platform.id).notNull(),
    is_active: t.boolean("is_active").default(false).notNull(),
    ext_id: t.varchar("ext_id").unique(),
    note: t.varchar("note"),
    ...reviewByMember,
    ...timestamps,
  },
  (table) => [
    t.unique().on(table.show_id, table.platform_id),
    t
      .index()
      .on(table.show_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.show_id, table.platform_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.platform_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.review_form_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.reviewer_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.ext_id)
      .where(isNull(table.deleted_at)),
  ]
);

export const selectShowSchema = createSelectSchema(showPlatform)
  .merge(
    z.object({
      client_uid: z.string(),
    })
  )
  .omit({
    id: true,
    show_id: true,
    platform_id: true,
    deleted_at: true,
  });

export const insertShowSchema = createInsertSchema(showPlatform)
  .merge(
    z.object({
      name: z.string().min(1),
      show_uid: z.string().startsWith(PREFIX.SHOW),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM),
      ext_id: z.string().min(1).optional(),
      note: z.string().min(1).optional(),
    })
  )
  .omit({
    uid: true,
    show_id: true,
    platform_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchShowSchema = createUpdateSchema(showPlatform)
  .merge(
    z.object({
      name: z.string().min(1).optional(),
      show_uid: z.string().startsWith(PREFIX.SHOW),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM),
      ext_id: z.string().min(1).optional(),
      note: z.string().min(1).optional(),
    })
  )
  .omit({
    uid: true,
    show_id: true,
    platform_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchBulkShowSchema = createUpdateSchema(showPlatform)
  .merge(
    z.object({
      name: z.string().min(1).optional(),
      show_uid: z.string().startsWith(PREFIX.SHOW),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM),
      ext_id: z.string().min(1).optional(),
      note: z.string().min(1).optional(),
    })
  )
  .omit({
    uid: true,
    show_id: true,
    platform_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export type SelectShowSchema = z.infer<typeof selectShowSchema>;
export type InsertShowSchema = z.infer<typeof insertShowSchema>;
export type PatchShowSchema = z.infer<typeof patchShowSchema>;
export type PatchBulkShowSchema = z.infer<typeof patchBulkShowSchema>;
