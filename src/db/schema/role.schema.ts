import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/columns.helpers";

export const role = table("role", {
  id: t.serial("id").primaryKey(),
  name: t.varchar("name").unique().notNull(),
  ...timestamps,
});
