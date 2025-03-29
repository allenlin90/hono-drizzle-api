import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { user } from "./user.schema";
import { showPlatform } from "./show-platform.schema";

export const showPlatformReview = table(
  "show_platform_review",
  {
    uid: brandedUid(PREFIX.SHOW_REVIEW),
    show_id: t.integer("show_id").notNull(),
    platform_id: t.integer("platform_id").notNull(),
    reviewer_id: t
      .integer("reviewer_id")
      .references(() => user.id)
      .notNull(),
    review_items: t.jsonb("review_items"),
    note: t.varchar("note"),
    ...timestamps,
  },
  (table) => [
    t.primaryKey({
      columns: [table.show_id, table.platform_id, table.reviewer_id],
    }),
    t
      .foreignKey({
        columns: [table.show_id, table.platform_id],
        foreignColumns: [showPlatform.show_id, showPlatform.platform_id],
      })
      .onUpdate("cascade"),
    t.index("show_platform_review_show_id_idx").on(table.show_id),
    t.index("show_platform_review_platform_id_idx").on(table.platform_id),
    t.index("show_platform_review_reviewer_id_idx").on(table.reviewer_id),
  ]
);
