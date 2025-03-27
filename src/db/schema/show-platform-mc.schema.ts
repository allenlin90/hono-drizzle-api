import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";

import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { showPlatform } from "./show-platform.schema";
import { mc } from "./mc.schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { PREFIX } from "@/constants";

export const showPlatformMc = table(
  "show_platform_mc",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.SHOW_PLATFORM_MC),
    show_platform_id: t
      .integer("show_platform_id")
      .references(() => showPlatform.id)
      .notNull(),
    mc_id: t
      .integer("mc_id")
      .references(() => mc.id)
      .notNull(),
    ...timestamps,
  },
  (table) => [t.unique().on(table.show_platform_id, table.mc_id)]
);

export const selectShowPlatformMcSchema = createSelectSchema(showPlatformMc)
  .merge(
    z.object({
      show_platform_uid: z.string().startsWith(PREFIX.SHOW_PLATFORM),
      mc_uid: z.string().startsWith(PREFIX.MC),
    })
  )
  .omit({
    id: true,
    show_platform_id: true,
    mc_id: true,
    deleted_at: true,
  });

export const insertShowPlatformMcSchema = createInsertSchema(showPlatformMc)
  .merge(
    z.object({
      show_platform_uid: z.string().startsWith(PREFIX.SHOW_PLATFORM),
      mc_uid: z.string().startsWith(PREFIX.MC),
    })
  )
  .omit({
    uid: true,
    show_platform_id: true,
    mc_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchShowPlatformMcSchema = createUpdateSchema(showPlatformMc)
  .merge(
    z.object({
      show_platform_uid: z.string().startsWith(PREFIX.SHOW_PLATFORM).optional(),
      mc_uid: z.string().startsWith(PREFIX.MC).optional(),
    })
  )
  .omit({
    uid: true,
    show_platform_id: true,
    mc_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export type SelectShowPlatformMcSchema = z.infer<
  typeof selectShowPlatformMcSchema
>;
export type InsertShowPlatformMcSchema = z.infer<
  typeof insertShowPlatformMcSchema
>;
export type PatchShowPlatformMcSchema = z.infer<
  typeof patchShowPlatformMcSchema
>;
