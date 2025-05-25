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
import { studio } from "./studio.schema";

export const roomTypeEnum = t.pgEnum("studio_room_type", ["s", "m", "l"]);

export const studioRoom = table(
  "studio_room",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.STUDIO_ROOM),
    name: t.varchar("name", { length: 255 }).notNull(),
    studio_id: t
      .integer("studio_id")
      .references(() => studio.id)
      .notNull(),
    type: roomTypeEnum().default("s").notNull(),
    ...timestamps,
  },
  (table) => [
    t
      .index()
      .on(table.name)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.studio_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.type)
      .where(isNull(table.deleted_at)),
    t
      .index("studio_room_name_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.name})`),
  ]
);

export const selectStudioRoomSchema = createSelectSchema(studioRoom)
  .merge(
    z.object({
      studio_uid: z.string().startsWith(PREFIX.STUDIO),
    })
  )
  .omit({
    id: true,
    studio_id: true,
    deleted_at: true,
  });

export const insertStudioRoomSchema = createInsertSchema(studioRoom)
  .merge(
    z.object({
      name: z.string().min(1),
      studio_uid: z.string().startsWith(PREFIX.STUDIO),
    })
  )
  .omit({
    uid: true,
    studio_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchStudioRoomSchema = createUpdateSchema(studioRoom)
  .merge(
    z.object({
      name: z.string().min(1).optional(),
      studio_uid: z.string().startsWith(PREFIX.STUDIO).optional(),
    })
  )
  .omit({
    uid: true,
    studio_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export type SelectStudioRoomSchema = z.infer<typeof selectStudioRoomSchema>;
export type InsertStudioRoomSchema = z.infer<typeof insertStudioRoomSchema>;
export type PatchStudioRoomSchema = z.infer<typeof patchStudioRoomSchema>;
