import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { isNull } from "drizzle-orm";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

export const formTypeEnum = t.pgEnum("onset_task_type", [
  "show_mc_review",
  "show_platform_review",
  "onset",
  "onset_pre_production",
  "onset_production",
  "onset_post_production",
  "offset",
  "other",
]);

export const formTemplate = table(
  "form_template",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.FORM_TEMPLATE),
    name: t.text("name").notNull(),
    type: formTypeEnum().notNull(),
    form: t.jsonb("form").default({}).notNull(),
    is_active: t.boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    t
      .index()
      .on(table.type, table.name, table.is_active)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.type)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.type, table.name)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.name)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.type, table.is_active)
      .where(isNull(table.deleted_at)),
    t
      .index()
      .on(table.name, table.is_active)
      .where(isNull(table.deleted_at)),
  ]);
