import {
  selectAddressSchema,
  type SelectAddressSchema,
} from "@/db/schema/address.schema";

export const AddressSchema = selectAddressSchema.transform((data) => ({
  id: data.uid,
  city_id: data.city_uid,
  address: data.address,
  sub_district: data.sub_district,
  district: data.district,
  postcode: data.postcode,
  province: data.province,
  created_at: data.created_at,
  updated_at: data.updated_at,
}));

export const addressSerializer = (address: SelectAddressSchema) => {
  const parsed = AddressSchema.parse(address);

  return {
    object: 'address',
    ...parsed,
  };
};
