import { z } from "@hono/zod-openapi";

import { showPlatformMc } from "@/db/schema/show-platform-mc.schema";
import { createSelectSchema } from "drizzle-zod";
import { selectBrandSchema } from "@/db/schema/brand.schema";
import { selectMcSchema } from "@/db/schema/mc.schema";
import { selectPlatformSchema } from "@/db/schema/platform.schema";
import { selectShowSchema } from "@/db/schema/show.schema";
import { selectStudioRoomSchema } from "@/db/schema/studio-room.schema";

export const showPlatformMcSchema = createSelectSchema(showPlatformMc)
  .merge(
    z.object({
      brand: selectBrandSchema,
      mc: selectMcSchema.omit({ user_uid: true }),
      platform: selectPlatformSchema,
      show: selectShowSchema.omit({ brand_uid: true }),
      studio_room: selectStudioRoomSchema.omit({ studio_uid: true }).nullable(),
    })
  )
  .omit({
    id: true,
    show_platform_id: true,
    mc_id: true,
    deleted_at: true,
  });

export type ShowPlatformSchema = z.infer<typeof showPlatformMcSchema>;

export const showPlatformMcSerializer = (
  showPlatformMc: ShowPlatformSchema
) => {
  return showPlatformMcSchema.parse(showPlatformMc);
};
