import {
  selectCitySchema,
  type SelectCitySchema,
} from "@/db/schema/city.schema";

export const CitySchema = selectCitySchema.transform((data) => ({
  id: data.uid,
  name: data.name,
  created_at: data.created_at,
  updated_at: data.updated_at,
}));

export const citySerializer = (city: SelectCitySchema) => {
  const parsed = CitySchema.parse(city);

  return {
    object: 'city',
    ...parsed,
  };
};
