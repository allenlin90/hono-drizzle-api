import {
  selectAddressSchema,
  type SelectAddressSchema,
} from "@/db/schema/address.schema";

export const addressSerializer = (address: SelectAddressSchema) => {
  return selectAddressSchema.parse(address);
};
