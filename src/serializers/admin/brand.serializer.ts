import {
  selectBrandSchema,
  type SelectBrandSchema,
} from "@/db/schema/client.schema";

export const brandSerializer = (brand: SelectBrandSchema) => {
  return selectBrandSchema.parse(brand);
};

export default brandSerializer;
