import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { showPlatformMc } from "./show-platform-mc.schema";
import { user } from "./user.schema";

export const mcShowReview = table("mc_show_review", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: brandedUid(PREFIX.MC_SHOW_REVIEW),
  review_items: t.jsonb("review_items"),
  reviewer_id: t
    .integer("reviewer_id")
    .references(() => user.id)
    .notNull(),
  show_platform_mc_id: t
    .integer("show_platform_mc_id")
    .references(() => showPlatformMc.id)
    .notNull(),
  note: t.varchar("note"),
  ...timestamps,
});
