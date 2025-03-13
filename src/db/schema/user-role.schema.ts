import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/columns.helpers";
import { user } from "./user.schema";
import { role } from "./role.schema";

export const userRole = table(
  "user_role",
  {
    id: t.serial("id").primaryKey(),
    userId: t
      .integer("user_id")
      .references(() => user.id)
      .notNull(),
    roleId: t
      .integer("role_id")
      .references(() => role.id)
      .notNull(),
    ...timestamps,
  },
  (table) => [t.unique().on(table.userId, table.roleId)]
);
