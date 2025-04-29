import {
  selectBrandMaterialSchema,
  type SelectBrandMaterialSchema,
} from "@/db/schema/brand-material.schema";

export const brandMaterialSerializer = (
  brandMaterial: SelectBrandMaterialSchema
) => {
  return selectBrandMaterialSchema.parse(brandMaterial);
};
