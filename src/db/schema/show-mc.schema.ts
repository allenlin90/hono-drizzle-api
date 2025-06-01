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
import { mc } from "./mc.schema";

export const showMc = table(
  "show_mc",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.SHOW_MC),
    show_id: t.integer("show_id").references(() => show.id).notNull(),
    mc_id: t.integer("mc_id").references(() => mc.id).notNull(),
    is_active: t.boolean("is_active").default(false).notNull(),
    note: t.varchar("note"),
    ...reviewByMember,
    ...timestamps,
  },
  (table) => [
    t.unique().on(table.show_id, table.mc_id),
    t
      .index()
      .on(table.show_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.show_id, table.mc_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.mc_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.mc_id, table.is_active)
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
      .on(table.note)
      .where(isNull(table.deleted_at)),
    t
      .index("show_mc_note_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.note})`),
  ]
);

export const selectShowMcSchema = createSelectSchema(showMc)
  .merge(
    z.object({
      client_uid: z.string(),
    })
  )
  .omit({
    id: true,
    show_id: true,
    mc_id: true,
    review_form_id: true,
    reviewer_id: true,
    deleted_at: true,
  });

export const insertShowMcSchema = createInsertSchema(showMc)
  .merge(
    z.object({
      name: z.string().min(1),
      show_id: z.string().startsWith(PREFIX.SHOW),
      mc_id: z.string().startsWith(PREFIX.MEMBER),
      review_form_id: z.string().startsWith(PREFIX.FORM_TEMPLATE).optional(),
      reviewer_id: z.string().startsWith(PREFIX.MEMBER).optional(),
      ext_id: z.string().min(1).optional(),
      note: z.string().min(1).optional(),
    })
  )
  .omit({
    uid: true,
    show_id: true,
    mc_id: true,
    review_form_id: true,
    reviewer_id: true,
    deleted_at: true,
  });

export const patchShowMcSchema = createUpdateSchema(showMc)
  .merge(
    z.object({
      name: z.string().min(1).optional(),
      show_id: z.string().startsWith(PREFIX.SHOW).optional(),
      mc_id: z.string().startsWith(PREFIX.MEMBER).optional(),
      review_form_id: z.string().startsWith(PREFIX.FORM_TEMPLATE).optional(),
      reviewer_id: z.string().startsWith(PREFIX.MEMBER).optional(),
      ext_id: z.string().min(1).optional(),
      note: z.string().min(1).optional(),
    })
  )
  .omit({
    uid: true,
    show_id: true,
    mc_id: true,
    review_form_id: true,
    reviewer_id: true,
    deleted_at: true,
  });

export const patchBulkShowMcSchema = createUpdateSchema(showMc)
  .merge(
    z.object({
      name: z.string().min(1).optional(),
      show_id: z.string().startsWith(PREFIX.SHOW).optional(),
      mc_id: z.string().startsWith(PREFIX.MEMBER).optional(),
      review_form_id: z.string().startsWith(PREFIX.FORM_TEMPLATE).optional(),
      reviewer_id: z.string().startsWith(PREFIX.MEMBER).optional(),
      ext_id: z.string().min(1).optional(),
      note: z.string().min(1).optional(),
    })
  )
  .omit({
    uid: true,
    show_id: true,
    mc_id: true,
    review_form_id: true,
    reviewer_id: true,
    deleted_at: true,
  });

export type SelectShowMcSchema = z.infer<typeof selectShowMcSchema>;
export type InsertShowMcSchema = z.infer<typeof insertShowMcSchema>;
export type PatchShowMcSchema = z.infer<typeof patchShowMcSchema>;
export type PatchBulkShowMcSchema = z.infer<typeof patchBulkShowMcSchema>;
