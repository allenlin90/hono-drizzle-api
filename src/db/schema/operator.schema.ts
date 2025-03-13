import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { user } from "./user.schema";

export const operator = table("operator", {
  id: t.serial("id").primaryKey(),
  uid: brandedUid(PREFIX.OPERATOR),
  name: t.varchar("name", { length: 255 }).notNull(),
  userId: t.integer("user_id").references(() => user.id),
  ...timestamps,
});
