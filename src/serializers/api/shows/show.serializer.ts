import { z } from "@hono/zod-openapi";
import { brand, platform, show, showPlatform, showPlatformMc, studioRoom } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

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

export const showDetailsTransformer = showSchema.transform((data) => ({

}));

export type ShowSchema = z.infer<typeof showSchema>;

export const showSerializer = (show: ShowSchema) => {
  return showTransformer.parse(show);
};

export const showDetailsSerializer = (show: ShowSchema) => {
  return showDetailsTransformer.parse(show);
};