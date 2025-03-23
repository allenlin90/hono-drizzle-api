import type { SelectPlatformSchema } from "@/db/schema/platform.schema";
import {
  selectShowPlatformSchema,
  type SelectShowPlatformSchema,
} from "@/db/schema/show-platform.schema";

export const showPlatformSerializer = (
  showPlatform: SelectShowPlatformSchema
) => {
  return selectShowPlatformSchema.parse(showPlatform);
};
