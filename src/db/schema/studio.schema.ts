import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { address } from "./address.schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const studio = table("studio", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: brandedUid(PREFIX.STUDIO),
  name: t.varchar("name").unique().notNull(),
  address_id: t.integer("address_id").references(() => address.id),
  ...timestamps,
});

export const selectStudioSchema = createSelectSchema(studio)
  .merge(
    z.object({
      address_uid: z.string().startsWith(PREFIX.ADDRESS),
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

export const patchStudioSchema = createUpdateSchema(studio)
  .merge(
    z.object({
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
