import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { operator } from "./operator.schema";
import { showPlatform } from "./show-platform.schema";

export const taskTypeEnum = t.pgEnum("task_type", [
  "PRE_PRODUCTION",
  "PRODUCTION",
  "POST_PRODUCTION",
]);

export const task = table("task", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: brandedUid(PREFIX.TASK),
  items: t.jsonb("items"),
  type: taskTypeEnum().notNull(),
  is_completed: t.boolean("is_completed").default(false),
  operator_id: t.integer("operator_id").references(() => operator.id),
  show_platform_id: t
    .integer("show_platform_id")
    .references(() => showPlatform.id)
    .notNull(),
  ...timestamps,
});
