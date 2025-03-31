import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";

import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { platform } from "./platform.schema";
import { show } from "./show.schema";
import { studioRoom } from "./studio-room.schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { PREFIX } from "@/constants";

// TODO: full text search with ts_vector
export const showPlatform = table(
  "show_platform",
  {
    uid: brandedUid(PREFIX.SHOW_PLATFORM),
    show_id: t
      .integer("show_id")
      .references(() => show.id)
      .notNull(),
    platform_id: t
      .integer("platform_id")
      .references(() => platform.id)
      .notNull(),
    studio_room_id: t.integer("studio_room_id").references(() => studioRoom.id),
    is_active: t.boolean("is_active").default(false).notNull(), // for show approval
    ...timestamps,
  },
  (table) => [
    t.primaryKey({ columns: [table.show_id, table.platform_id] }),
    t.index("show_platform_show_id_idx").on(table.show_id),
    t.index("show_platform_platform_id_idx").on(table.platform_id),
    t
      .index("show_platform_show_id_platform_id_idx")
      .on(table.show_id, table.platform_id),
    t.index("show_platform_studio_room_id_idx").on(table.studio_room_id),
  ]
);

// basic schema without expand
export const selectShowPlatformSchema = createSelectSchema(showPlatform)
  .merge(
    z.object({
      show_uid: z.string().startsWith(PREFIX.SHOW),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM),
      studio_room_uid: z.string().startsWith(PREFIX.STUDIO_ROOM).nullable(),
    })
  )
  .omit({
    show_id: true,
    platform_id: true,
    studio_room_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const insertShowPlatformSchema = createInsertSchema(showPlatform)
  .merge(
    z.object({
      show_uid: z.string().startsWith(PREFIX.SHOW),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM),
      studio_room_uid: z.string().startsWith(PREFIX.STUDIO_ROOM).nullable(),
    })
  )
  .omit({
    uid: true,
    show_id: true,
    platform_id: true,
    studio_room_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchShowPlatformSchema = createUpdateSchema(showPlatform)
  .merge(
    z.object({
      show_uid: z.string().startsWith(PREFIX.SHOW).optional(),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM).optional(),
      studio_room_uid: z
        .string()
        .startsWith(PREFIX.STUDIO_ROOM)
        .nullable()
        .optional(),
    })
  )
  .omit({
    uid: true,
    show_id: true,
    platform_id: true,
    studio_room_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export type SelectShowPlatformSchema = z.infer<typeof selectShowPlatformSchema>;
export type InsertShowPlatformSchema = z.infer<typeof insertShowPlatformSchema>;
export type PatchShowPlatformSchema = z.infer<typeof patchShowPlatformSchema>;

export type ShowPlatformSchema = typeof showPlatform.$inferSelect;
