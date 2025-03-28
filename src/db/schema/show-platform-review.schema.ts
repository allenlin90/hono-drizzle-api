import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { user } from "./user.schema";
import { showPlatform } from "./show-platform.schema";

export const showPlatformReview = table(
  "show_platform_review",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.SHOW_REVIEW),
    show_platform_id: t
      .integer("show_platform_id")
      .references(() => showPlatform.id)
      .notNull(),
    reviewer_id: t
      .integer("reviewer_id")
      .references(() => user.id)
      .notNull(),
    review_items: t.jsonb("review_items"),
    note: t.varchar("note"),
    ...timestamps,
  },
  (table) => [
    t
      .index("show_platform_review_show_platform_id_idx")
      .on(table.show_platform_id),
    t.index("show_platform_review_reviewer_id_idx").on(table.reviewer_id),
  ]
);
