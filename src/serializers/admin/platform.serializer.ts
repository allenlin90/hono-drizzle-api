import {
  selectPlatformSchema,
  type SelectPlatformSchema,
} from "@/db/schema/platform.schema";

export const PlatformSchema = selectPlatformSchema.transform((data) => ({
  id: data.uid,
  name: data.name,
  created_at: data.created_at,
  updated_at: data.updated_at,
}));

export const platformSerializer = (platform: SelectPlatformSchema) => {
  const parsed = PlatformSchema.parse(platform);

  return {
    object: "platform",
    ...parsed,
  };
};

export default platformSerializer;
