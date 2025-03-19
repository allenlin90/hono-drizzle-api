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

// TODO: find a better way to extend associated data
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
  });
