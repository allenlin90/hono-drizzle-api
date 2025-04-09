import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";
import { isNull } from "drizzle-orm";

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
    uid: brandedUid(PREFIX.SHOW_PLATFORM_MC),
    show_id: t.integer("show_id").notNull(),
    platform_id: t.integer("platform_id").notNull(),
    mc_id: t
      .integer("mc_id")
      .references(() => mc.id)
      .notNull(),
    ...timestamps,
  },
  (table) => [
    t.primaryKey({
      columns: [table.show_id, table.platform_id, table.mc_id],
    }),
    t
      .foreignKey({
        columns: [table.show_id, table.platform_id],
        foreignColumns: [showPlatform.show_id, showPlatform.platform_id],
      })
      .onUpdate("cascade"),
    t
      .index("show_platform_mc_show_id_idx")
      .on(table.show_id)
      .where(isNull(table.deleted_at)),
    t
      .index("show_platform_mc_platform_id_idx")
      .on(table.platform_id)
      .where(isNull(table.deleted_at)),
    t
      .index("show_platform_mc_show_id_platform_id_idx")
      .on(table.show_id, table.platform_id)
      .where(isNull(table.deleted_at)),
    t
      .index("show_platform_mc_mc_id_idx")
      .on(table.mc_id)
      .where(isNull(table.deleted_at)),
  ]
);

export const selectShowPlatformMcSchema = createSelectSchema(showPlatformMc)
  .merge(
    z.object({
      show_uid: z.string().startsWith(PREFIX.SHOW),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM),
      mc_uid: z.string().startsWith(PREFIX.MC),
    })
  )
  .omit({
    show_id: true,
    platform_id: true,
    mc_id: true,
    deleted_at: true,
  });

export const insertShowPlatformMcSchema = createInsertSchema(showPlatformMc)
  .merge(
    z.object({
      show_uid: z.string().startsWith(PREFIX.SHOW),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM),
      mc_uid: z.string().startsWith(PREFIX.MC),
    })
  )
  .omit({
    uid: true,
    show_id: true,
    platform_id: true,
    mc_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchShowPlatformMcSchema = createUpdateSchema(showPlatformMc)
  .merge(
    z.object({
      show_uid: z.string().startsWith(PREFIX.SHOW).optional(),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM).optional(),
      mc_uid: z.string().startsWith(PREFIX.MC).optional(),
    })
  )
  .omit({
    uid: true,
    show_id: true,
    platform_id: true,
    mc_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchBulkShowPlatformMcSchema = patchShowPlatformMcSchema.extend({
  show_platform_mc_uid: z.string().startsWith(PREFIX.SHOW_PLATFORM_MC),
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
export type PatchBulkShowPlatformMcSchema = z.infer<
  typeof patchBulkShowPlatformMcSchema
>;
