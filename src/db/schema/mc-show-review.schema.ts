import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { showPlatformMc } from "./show-platform-mc.schema";
import { user } from "./user.schema";

export const mcShowReview = table(
  "mc_show_review",
  {
    uid: brandedUid(PREFIX.MC_SHOW_REVIEW),
    review_items: t.jsonb("review_items"),
    reviewer_id: t
      .integer("reviewer_id")
      .references(() => user.id)
      .notNull(),
    show_id: t.integer("show_id").notNull(),
    platform_id: t.integer("platform_id").notNull(),
    mc_id: t.integer("mc_id").notNull(),
    note: t.varchar("note"),
    ...timestamps,
  },
  (table) => [
    t.primaryKey({
      columns: [
        table.show_id,
        table.platform_id,
        table.mc_id,
        table.reviewer_id,
      ],
    }),
    t
      .foreignKey({
        columns: [table.show_id, table.platform_id, table.mc_id],
        foreignColumns: [
          showPlatformMc.show_id,
          showPlatformMc.platform_id,
          showPlatformMc.mc_id,
        ],
      })
      .onUpdate("cascade"),
    t.index("mc_show_review_reviewer_id_idx").on(table.reviewer_id),
    t.index("mc_show_review_show_id_idx").on(table.show_id),
    t.index("mc_show_review_platform_id_idx").on(table.platform_id),
    t.index("mc_show_review_mc_id_idx").on(table.mc_id),
  ]
);
