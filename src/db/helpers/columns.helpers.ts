import { integer, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";

import type { PREFIX } from "@/constants";
import { generateBrandedUid } from "./random-string.helpers";
import { formTemplate, member } from "../schema";

export const timestamps = {
  created_at: timestamp("created_at", { mode: "string" })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { mode: "string" })
    .defaultNow()
    .notNull(),
  deleted_at: timestamp("deleted_at", { mode: "string" }),
};

export const brandedUid = (prefix: PREFIX) =>
  varchar("uid", { length: 255 })
    .$default(() => generateBrandedUid(prefix))
    .unique()
    .notNull();

export const reviewByMember = {
  review_form_id: integer("review_form_id").references(() => formTemplate.id),
  review_items: jsonb("review_items").default({}).notNull(),
  reviewer_id: integer("reviewer_id").references(() => member.id),
};
