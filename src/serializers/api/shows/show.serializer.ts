import { z } from "@hono/zod-openapi";
import { brand, platform, show, showPlatform, showPlatformMc, studioRoom } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { selectBrandSchema } from "@/db/schema/brand.schema";
import { selectPlatformSchema } from "@/db/schema/platform.schema";
import { selectShowSchema } from "@/db/schema/show.schema";
import { selectStudioRoomSchema } from "@/db/schema/studio-room.schema";
import { selectShowPlatformSchema } from "@/db/schema/show-platform.schema";

export const showSchema = createSelectSchema(showPlatformMc)
  .extend({
    brand: createSelectSchema(brand),
    platform: createSelectSchema(platform),
    showPlatform: createSelectSchema(showPlatform),
    show: createSelectSchema(show),
    studio_room: createSelectSchema(studioRoom).nullable(),
  });

export const showTransformer = showSchema.transform((data) => ({
  uid: data.show.uid,
  brand: data.brand.name,
  alias_id: data.showPlatform.alias_id,
  is_active: data.showPlatform.is_active,
  name: data.show.name,
  studio_room: data.studio_room?.name,
  start_time: data.show.start_time,
  end_time: data.show.end_time,
}));

export const showDetailsSchema = createSelectSchema(showPlatformMc)
  .extend({
    brand: createSelectSchema(brand),
    platform: createSelectSchema(platform),
    show_platform: createSelectSchema(showPlatform),
    show: createSelectSchema(show),
    studio_room: createSelectSchema(studioRoom).nullable(),
  });

export const showDetailsTransformer = showDetailsSchema
  .transform((data) => ({
    uid: data.uid,
    brand: selectBrandSchema.parse(data.brand),
    platform: selectPlatformSchema.parse(data.platform),
    show_platform: selectShowPlatformSchema
      .omit({ show_uid: true, platform_uid: true, studio_room_uid: true })
      .parse(data.show_platform),
    show: selectShowSchema
      .omit({ brand_uid: true })
      .parse(data.show),
    studio_room: selectStudioRoomSchema
      .omit({ studio_uid: true })
      .nullable()
      .parse(data.studio_room),
  }));

export type ShowSchema = z.infer<typeof showSchema>;
export type ShowDetailsSchema = z.infer<typeof showDetailsSchema>;

export const showSerializer = (show: ShowSchema) => {
  return showTransformer.parse(show);
};

export const showDetailsSerializer = (show: ShowDetailsSchema) => {
  return showDetailsTransformer.parse(show);
};