import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

export const city = table("city", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: brandedUid(PREFIX.CITY),
  name: t.varchar("name").unique().notNull(),
  ...timestamps,
});
