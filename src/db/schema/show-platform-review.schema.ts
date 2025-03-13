import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { user } from "./user.schema";
import { showPlatform } from "./show-platform.schema";

export const showPlatformReview = table("show_platform_review", {
  id: t.serial("id").primaryKey(),
  uid: brandedUid(PREFIX.SHOW_REVIEW),
  showPlatformId: t
    .integer("show_platform_id")
    .references(() => showPlatform.id)
    .notNull(),
  reviewerId: t
    .integer("reviewer_id")
    .references(() => user.id)
    .notNull(),
  reviewItems: t.jsonb("review_items"),
  note: t.varchar("note"),
  ...timestamps,
});
