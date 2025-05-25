import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { isNull } from "drizzle-orm";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { member } from "./member.schema";
import { show } from "./show.schema";
import { formTemplate } from "./form-template.schema";

export const onsetTaskTypeEnum = t.pgEnum("onset_task_type", [
  "pre_production",
  "production",
  "post_production",
]);

export const onsetTask = table(
  "onset_task",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.TASK),
    type: onsetTaskTypeEnum().notNull(),
    items: t.jsonb("items"),
    form_id: t.integer("form_id").references(() => formTemplate.id),
    show_id: t.integer("show_id").references(() => show.id).notNull(),
    assignee_id: t.integer("assignee_id").references(() => member.id),
    is_completed: t.boolean("is_completed").default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    t
      .index()
      .on(table.type)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.assignee_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.assignee_id, table.is_completed)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.show_id)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.show_id, table.is_completed)
      .where(isNull(table.deleted_at)),
  ]
);
