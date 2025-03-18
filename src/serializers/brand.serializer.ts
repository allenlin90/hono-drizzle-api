import { brand, selectBrandsSchema } from "@/db/schema/brand.schema";

type Brand = typeof brand.$inferSelect;

export const brandSerializer = (brand: Brand) => {
  return selectBrandsSchema.parse(brand);
};

export default brandSerializer;
