import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";

import { showPlatform } from "@/db/schema/show-platform.schema";
import { selectPlatformSchema } from "@/db/schema/platform.schema";
import { selectShowSchema } from "@/db/schema/show.schema";
import { selectStudioRoomSchema } from "@/db/schema/studio-room.schema";
import { selectStudioSchema } from "@/db/schema/studio.schema";

export const showPlatformSchema = createSelectSchema(showPlatform)
  .merge(
    z.object({
      platform: selectPlatformSchema,
      show: selectShowSchema,
      studio_room: selectStudioRoomSchema.omit({ studio_uid: true }).nullable(),
      studio: selectStudioSchema.omit({ address_uid: true }).nullable(),
    })
  )
  .omit({
    show_id: true,
    platform_id: true,
    studio_room_id: true,
    deleted_at: true,
  })
  .transform((value) => {
    const { studio, studio_room, ...rest } = value;
    const studioRoom = studio_room
      ? { ...studio_room, ...(studio && { studio_uid: studio.uid }) }
      : null;

    return {
      ...rest,
      studio_room: studioRoom,
    };
  });

export type ShowPlatformSchema = z.infer<typeof showPlatformSchema>;

export const showPlatformSerializer = (showPlatform: ShowPlatformSchema) => {
  return showPlatformSchema.parse(showPlatform);
};
