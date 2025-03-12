import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { address } from "./address.schema";

export const studio = table(
  "studio",
  {
    id: t.serial("id").primaryKey(),
    uid: brandedUid(PREFIX.STUDIO),
    name: t.varchar("name", { length: 255 }).unique().notNull(),
    address: t.integer().references(() => address.id),
    ...timestamps,
  },
  (table) => [
    t.uniqueIndex("uid_idx").on(table.uid),
    t.uniqueIndex("name_idx").on(table.name),
  ]
);
