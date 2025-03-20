import {
  selectPlatformSchema,
  type SelectPlatformSchema,
} from "@/db/schema/platform.schema";

export const platformSerializer = (platform: SelectPlatformSchema) => {
  return selectPlatformSchema.parse(platform);
};

export default platformSerializer;
