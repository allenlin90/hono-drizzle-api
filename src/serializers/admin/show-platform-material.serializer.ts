import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";

import { showPlatformMaterial } from "@/db/schema";
import { selectPlatformSchema } from "@/db/schema/platform.schema";
import { selectShowSchema } from "@/db/schema/show.schema";
import { selectBrandSchema } from "@/db/schema/client.schema";
import { selectBrandMaterialSchema } from "@/db/schema/material.schema";

export const showPlatformMaterialSchema = createSelectSchema(
  showPlatformMaterial
)
  .merge(
    z.object({
      brand: selectBrandSchema,
      material: selectBrandMaterialSchema.omit({ brand_uid: true }),
      platform: selectPlatformSchema,
      show: selectShowSchema.omit({ brand_uid: true }),
    })
  )
  .omit({
    brand_material_id: true,
    platform_id: true,
    show_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export type ShowPlatformMaterialSchema = z.infer<
  typeof showPlatformMaterialSchema
>;

export const showPlatformMaterialSerializer = (
  showPlatformMaterial: ShowPlatformMaterialSchema
) => {
  return showPlatformMaterialSchema.parse(showPlatformMaterial);
};
