import {
  selectCitySchema,
  type SelectCitySchema,
} from "@/db/schema/city.schema";

export const citySerializer = (city: SelectCitySchema) => {
  return selectCitySchema.parse(city);
};
