import { z } from "@hono/zod-openapi";

import { PREFIX } from "@/constants";
import {
  insertShowPlatformSchema,
  patchShowPlatformSchema,
} from "@/db/schema/show-platform.schema";

// create show-platform by show uid and platform uid
const createShowPlatformPayloadSchema = insertShowPlatformSchema;

// update existing show-platform by show-platform uid
const patchShowPlatformPayloadSchema = z
  .object({
    show_platform_uid: z.string().startsWith(PREFIX.SHOW_PLATFORM),
  })
  .merge(patchShowPlatformSchema);

export const bulkUpsertShowPlatformPayloadSchema = z.object({
  show_platforms: z.array(
    z.union([createShowPlatformPayloadSchema, patchShowPlatformPayloadSchema])
  ),
});
