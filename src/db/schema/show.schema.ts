import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "@hono/zod-openapi";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { brand } from "./brand.schema";

export const show = table(
  "show",
  {
    id: t.serial("id").primaryKey(),
    uid: brandedUid(PREFIX.SHOW),
    name: t.varchar("name").notNull(),
    brandId: t
      .integer("brand_id")
      .references(() => brand.id)
      .notNull(),
    startTime: t.timestamp("start_time", { mode: "string" }).notNull(),
    endTime: t.timestamp("end_time", { mode: "string" }).notNull(),
    ...timestamps,
  },
  (table) => [t.index("show_name_idx").on(table.name)]
);

export const selectShowSchema = createSelectSchema(show)
  .merge(
    z.object({
      brand_id: z.string().optional(),
    })
  )
  .omit({
    id: true,
    brandId: true,
    deletedAt: true,
  })
  .transform((input) => ({
    uid: input.uid,
    brand_id: input.brand_id,
    name: input.name,
    start_time: input.startTime,
    end_time: input.endTime,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  }));

export const insertShowSchema = z
  .object({
    name: z.string().min(1).max(255),
    brand_id: z
      .string()
      .startsWith(PREFIX.BRAND)
      .openapi({
        example: `${PREFIX.BRAND}_1234`,
      }),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
  })
  .transform((input) => ({
    name: input.name,
    brandId: input.brand_id,
    startTime: input.start_time,
    endTime: input.end_time,
  }));
