import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/columns.helpers";
import { showPlatform } from "./show-platform.schema";
import { mc } from "./mc.schema";

export const showPlatformMc = table("show_platform_mc", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  show_platform_id: t
    .integer("show_platform_id")
    .references(() => showPlatform.id)
    .notNull(),
  mcId: t
    .integer("mc_id")
    .references(() => mc.id)
    .notNull(),
  ...timestamps,
});
