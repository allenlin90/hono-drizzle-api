import { z } from "@hono/zod-openapi";
import { cityIdSchema } from "../params/id-query-params";
import PageParams from "../params/page-params";

export const AddressParamFilters = PageParams()
  .merge(
    z.object({
      address: z.string().min(1).optional(),
      sub_district: z.string().min(1).optional(),
      district: z.string().min(1).optional(),
      province: z.string().min(1).optional(),
      postcode: z.string().min(1).optional(),
    })
  )
  .merge(cityIdSchema);

export default AddressParamFilters;
