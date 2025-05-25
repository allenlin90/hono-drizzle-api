import {
  selectBrandMaterialSchema,
  type SelectBrandMaterialSchema,
} from "@/db/schema/material.schema";

export const brandMaterialSerializer = (
  brandMaterial: SelectBrandMaterialSchema
) => {
  return selectBrandMaterialSchema.parse(brandMaterial);
};
