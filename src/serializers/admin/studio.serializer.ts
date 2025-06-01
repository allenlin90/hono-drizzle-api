import {
  selectStudioSchema,
  type SelectStudioSchema,
} from "@/db/schema/studio.schema";

export const StudioSchema = selectStudioSchema.transform((data) => ({
  id: data.uid,
  name: data.name,
  address_id: data.address_uid,
  created_at: data.created_at,
  updated_at: data.updated_at,
}));

export const studioSerializer = (studio: SelectStudioSchema) => {
  const parsed = StudioSchema.parse(studio);

  return {
    object: "studio",
    ...parsed,
  };
};
