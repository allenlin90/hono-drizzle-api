import { z } from "@hono/zod-openapi";

import type { Nullable } from "@/lib/types";
import { selectBrandMaterialSchema } from "@/db/schema/material.schema";

export const showMaterialSerializer = (showMaterial: Nullable<BrandMaterialSchema>) => {
  return selectBrandMaterialSchema.parse(showMaterial);
};

export type BrandMaterialSchema = z.infer<typeof selectBrandMaterialSchema>;
