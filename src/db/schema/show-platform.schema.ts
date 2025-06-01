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
import { reviewByMember } from "../helpers/reviews.helpers";
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

export const selectShowPlatformSchema = createSelectSchema(showPlatform)
  .merge(
    z.object({
      show_uid: z.string().startsWith(PREFIX.SHOW),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM),
      reviewer_uid: z.string().startsWith(PREFIX.MEMBER).nullable(),
      review_form_uid: z.string().startsWith(PREFIX.FORM_TEMPLATE).nullable(),
    })
  )
  .omit({
    id: true,
    show_id: true,
    platform_id: true,
    deleted_at: true,
  });

export const insertShowPlatformSchema = createInsertSchema(showPlatform)
  .merge(
    z.object({
      name: z.string().min(1),
      show_uid: z.string().startsWith(PREFIX.SHOW),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM),
      reviewer_uid: z.string().startsWith(PREFIX.MEMBER).nullish(),
      review_form_uid: z.string().startsWith(PREFIX.FORM_TEMPLATE).nullish(),
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

export const patchShowPlatformSchema = createUpdateSchema(showPlatform)
  .merge(
    z.object({
      show_platform_uid: z.string().startsWith(PREFIX.SHOW_PLATFORM).nullish(),
      show_uid: z.string().startsWith(PREFIX.SHOW).nullish(),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM).nullish(),
      reviewer_uid: z.string().startsWith(PREFIX.MEMBER).nullish(),
      review_form_uid: z.string().startsWith(PREFIX.FORM_TEMPLATE).nullish(),
      ext_id: z.string().min(1).nullish(),
      note: z.string().min(1).nullish(),
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

export const patchBulkShowPlatformSchema = createUpdateSchema(showPlatform)
  .merge(
    z.object({
      show_platform_uid: z.string().startsWith(PREFIX.SHOW_PLATFORM).nullish(),
      show_uid: z.string().startsWith(PREFIX.SHOW).nullish(),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM).nullish(),
      reviewer_uid: z.string().startsWith(PREFIX.MEMBER).nullish(),
      review_form_uid: z.string().startsWith(PREFIX.FORM_TEMPLATE).nullish(),
      is_active: z.boolean().nullish(),
      ext_id: z.string().min(1).nullish(),
      note: z.string().min(1).nullish(),
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

export type SelectShowPlatformSchema = z.infer<typeof selectShowPlatformSchema>;
export type InsertShowPlatformSchema = z.infer<typeof insertShowPlatformSchema>;
export type PatchShowPlatformSchema = z.infer<typeof patchShowPlatformSchema>;
export type PatchBulkShowPlatformSchema = z.infer<typeof patchBulkShowPlatformSchema>;
