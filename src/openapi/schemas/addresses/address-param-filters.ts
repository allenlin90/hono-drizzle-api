import { z } from "@hono/zod-openapi";
import CityIdQueryParams from "../city-id-query-params";

export const AddressParamFilters = z
  .object({
    address: z.string().min(1).optional(),
    sub_district: z.string().min(1).optional(),
    district: z.string().min(1).optional(),
    province: z.string().min(1).optional(),
    postcode: z.string().min(1).optional(),
  })
  .merge(CityIdQueryParams());

export default AddressParamFilters;
