import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

export const platform = table("platform", {
  id: t.serial("id").primaryKey(),
  uid: brandedUid(PREFIX.PLATFORM),
  name: t.varchar("name", { length: 255 }).unique().notNull(),
  ...timestamps,
});
