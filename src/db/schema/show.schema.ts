import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { brand } from "./brand.schema";

export const show = table(
  "show",
  {
    id: t.serial("id").primaryKey(),
    uid: brandedUid(PREFIX.SHOW),
    name: t.varchar("name", { length: 255 }).notNull(),
    brandId: t
      .integer("brand_id")
      .references(() => brand.id)
      .notNull(),
    startTime: t.timestamp("start_time", { mode: "string" }).notNull(),
    endTime: t.timestamp("end_time", { mode: "string" }).notNull(),
    ...timestamps,
  },
  (table) => [
    t.uniqueIndex("uid_idx").on(table.uid),
    t.index("name_idx").on(table.name),
  ]
);
