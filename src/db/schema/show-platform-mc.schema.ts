import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/columns.helpers";
import { showPlatform } from "./show-platform";
import { mc } from "./mc.schema";

export const showPlatformMc = table(
  "show_platform_mc",
  {
    id: t.serial("id").primaryKey(),
    showPlatformId: t
      .integer("show_platform_id")
      .references(() => showPlatform.id)
      .notNull(),
    mcId: t
      .integer("mc_id")
      .references(() => mc.id)
      .notNull(),
    ...timestamps,
  },
  (table) => [t.unique().on(table.showPlatformId, table.mcId)]
);
