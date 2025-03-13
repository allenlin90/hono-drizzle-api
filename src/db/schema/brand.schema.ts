import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

export const brand = table("brand", {
  id: t.serial("id").primaryKey(),
  uid: brandedUid(PREFIX.BRAND),
  name: t.varchar("name").unique().notNull(),
  ...timestamps,
});
