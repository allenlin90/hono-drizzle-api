import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/columns.helpers";
import { showPlatform } from "./show-platform.schema";

export const showPlatformMechanic = table(
  "show_platform_mechanic",
  {
    id: t.serial("id").primaryKey(),
    showPlatformId: t
      .integer("show_platform_id")
      .references(() => showPlatform.id)
      .notNull(),
    mechanicId: t.integer("mechanic_id").notNull(),
    ...timestamps,
  },
  (table) => [t.unique().on(table.showPlatformId, table.mechanicId)]
);
