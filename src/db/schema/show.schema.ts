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
import { client } from "./client.schema";
import { studioRoom } from "./studio-room.schema";

export const show = table(
  "show",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.SHOW),
    name: t.varchar("name").notNull(),
    client_id: t
      .integer("client_id")
      .references(() => client.id),
    start_time: t.timestamp("start_time", { mode: "string" }).notNull(),
    end_time: t.timestamp("end_time", { mode: "string" }).notNull(),
    studio_room_id: t
      .integer("studio_room_id")
      .references(() => studioRoom.id),
    ...timestamps,
  },
  (table) => [
    t.check("show_time_check", sql`${table.end_time} > ${table.start_time}`),
    t
      .index()
      .on(table.name)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.client_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.start_time)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.end_time)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.studio_room_id)
      .where(isNull(table.deleted_at)),
    t
      .index("show_name_search_idx")
      .using("gin", sql`to_tsvector('english', ${table.name})`),
  ]
);

export const selectShowSchema = createSelectSchema(show)
  .merge(
    z.object({
      client_uid: z.string(),
    })
  )
  .omit({
    id: true,
    client_id: true,
    deleted_at: true,
  });

export const insertShowSchema = createInsertSchema(show)
  .merge(
    z.object({
      client_uid: z.string().startsWith(PREFIX.CLIENT).optional(),
      name: z.string().min(1),
      start_time: z.string().datetime(),
      end_time: z.string().datetime(),
    })
  )
  .omit({
    uid: true,
    client_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  })
  .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: "end_time must be later than start_time",
  });

export const patchShowSchema = createUpdateSchema(show)
  .merge(
    z.object({
      client_uid: z.string().startsWith(PREFIX.CLIENT).optional(),
      name: z.string().min(1).optional(),
    })
  )
  .omit({
    uid: true,
    client_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  })
  .refine(
    (data) =>
      !data.start_time ||
      !data.end_time ||
      new Date(data.end_time) > new Date(data.start_time),
    { message: "end_time must be later than start_time" }
  );

export const patchBulkShowSchema = createUpdateSchema(show)
  .merge(
    z.object({
      show_uid: z.string().startsWith(PREFIX.SHOW),
      name: z.string().min(1).optional(),
    })
  )
  .omit({
    uid: true,
    client_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  })
  .refine(
    (data) =>
      !data.start_time ||
      !data.end_time ||
      new Date(data.end_time) > new Date(data.start_time),
    { message: "end_time must be later than start_time" }
  );

export type SelectShowSchema = z.infer<typeof selectShowSchema>;
export type InsertShowSchema = z.infer<typeof insertShowSchema>;
export type PatchShowSchema = z.infer<typeof patchShowSchema>;
export type PatchBulkShowSchema = z.infer<typeof patchBulkShowSchema>;
