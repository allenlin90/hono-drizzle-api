import {
  selectShowPlatformSchema,
  type SelectShowPlatformSchema
} from "@/db/schema/show-platform.schema";

export const ShowPlatformSchema = selectShowPlatformSchema.transform((data) => ({
  id: data.uid,
  platform_id: data.platform_uid,
  show_id: data.show_uid,
  ext_id: data.ext_id,
  is_active: data.is_active,
  note: data.note,
  reviewer_id: data.reviewer_uid,
  review_items: data.review_items,
  review_form_id: data.review_form_uid,
  created_at: data.created_at,
  updated_at: data.updated_at,
}));

export const showPlatformSerializer = (showPlatform: SelectShowPlatformSchema) => {
  const parsed = ShowPlatformSchema.parse(showPlatform);

  return {
    object: "show_platform",
    ...parsed,
  };
};
