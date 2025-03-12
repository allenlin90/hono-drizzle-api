import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

export const brand = table(
  "brand",
  {
    id: t.serial("id").primaryKey(),
    uid: brandedUid(PREFIX.BRAND),
    name: t.varchar("name", { length: 255 }).unique().notNull(),
    ...timestamps,
  },
  (table) => [
    t.uniqueIndex("brand_uid_idx").on(table.uid),
    t.uniqueIndex("brand_name_idx").on(table.name),
  ]
);
