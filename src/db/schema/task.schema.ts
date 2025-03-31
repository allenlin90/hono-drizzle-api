import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { isNull } from "drizzle-orm";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { operator } from "./operator.schema";
import { showPlatform } from "./show-platform.schema";

export const taskTypeEnum = t.pgEnum("task_type", [
  "PRE_PRODUCTION",
  "PRODUCTION",
  "POST_PRODUCTION",
]);

export const task = table(
  "task",
  {
    uid: brandedUid(PREFIX.TASK),
    items: t.jsonb("items"),
    type: taskTypeEnum().notNull(),
    is_completed: t.boolean("is_completed").default(false),
    operator_id: t.integer("operator_id").references(() => operator.id),
    show_id: t.integer("show_id").notNull(),
    platform_id: t.integer("platform_id").notNull(),
    ...timestamps,
  },
  (table) => [
    t.primaryKey({
      columns: [table.show_id, table.platform_id, table.operator_id],
    }),
    t.foreignKey({
      columns: [table.show_id, table.platform_id],
      foreignColumns: [showPlatform.show_id, showPlatform.platform_id],
    }),
    t
      .index("task_operator_id_idx")
      .on(table.operator_id)
      .where(isNull(table.deleted_at)),
    t
      .index("task_show_id_idx")
      .on(table.show_id)
      .where(isNull(table.deleted_at)),
    t
      .index("task_show_id_platform_id_idx")
      .on(table.show_id, table.platform_id)
      .where(isNull(table.deleted_at)),
    t
      .index("task_platform_id_idx")
      .on(table.platform_id)
      .where(isNull(table.deleted_at)),
  ]
);
