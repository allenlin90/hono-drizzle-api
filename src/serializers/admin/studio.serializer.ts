import {
  selectStudioSchema,
  type SelectStudioSchema,
} from "@/db/schema/studio.schema";

export const studioSerializer = (studio: SelectStudioSchema) => {
  return selectStudioSchema.parse(studio);
};
