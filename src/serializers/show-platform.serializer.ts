import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";

import { showPlatform } from "@/db/schema/show-platform.schema";
import { selectPlatformSchema } from "@/db/schema/platform.schema";
import { selectShowSchema } from "@/db/schema/show.schema";
import { selectStudioRoomSchema } from "@/db/schema/studio-room.schema";

export const showPlatformSchema = createSelectSchema(showPlatform)
  .merge(
    z.object({
      platform: selectPlatformSchema,
      show: selectShowSchema,
      studio_room: selectStudioRoomSchema,
    })
  )
  .omit({
    id: true,
    show_id: true,
    platform_id: true,
    studio_room_id: true,
    deleted_at: true,
  });

export type ShowPlatformSchema = z.infer<typeof showPlatformSchema>;

export const showPlatformSerializer = (showPlatform: ShowPlatformSchema) => {
  return showPlatformSchema.parse(showPlatform);
};
