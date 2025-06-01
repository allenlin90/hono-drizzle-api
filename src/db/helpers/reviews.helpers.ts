import { integer, jsonb } from "drizzle-orm/pg-core";
import { formTemplate, member } from "../schema";

export const reviewByMember = {
  review_form_id: integer("review_form_id").references(() => formTemplate.id),
  review_items: jsonb("review_items").default({}).notNull(),
  reviewer_id: integer("reviewer_id").references(() => member.id),
};
