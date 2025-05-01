import { z } from "@hono/zod-openapi";
import { brand, platform, show, showPlatform, showPlatformMaterial, showPlatformMc, studio, studioRoom } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { PREFIX } from "@/constants";

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

export const brandMaterialSchema = createSelectSchema(showPlatformMaterial)
  .pick({
    show_id: true,
    platform_id: true,
    brand_material_id: true,
  })
  .extend({
    uid: z.string().startsWith(PREFIX.MATERIAL),
    type: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    resource_url: z.string().nullable(),
  });

export const showDetailsSchema = createSelectSchema(showPlatformMc)
  .extend({
    brand: createSelectSchema(brand),
    platform: createSelectSchema(platform),
    show_platform: createSelectSchema(showPlatform),
    show: createSelectSchema(show),
    studio_room: createSelectSchema(studioRoom).nullable(),
    studio: createSelectSchema(studio).nullable(),
    materials: z.array(brandMaterialSchema)
  });

export const showDetailsTransformer = showDetailsSchema
  .transform((data) => ({}));

export type ShowSchema = z.infer<typeof showSchema>;
export type ShowDetailsSchema = z.infer<typeof showDetailsSchema>;
export type BrandMaterialSchema = z.infer<typeof brandMaterialSchema>;

export const showSerializer = (show: ShowSchema) => {
  return showTransformer.parse(show);
};

export const showDetailsSerializer = (show: ShowDetailsSchema) => {
  return showDetailsTransformer.parse(show);
};