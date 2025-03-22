import { z } from "@hono/zod-openapi";
import { AddressIdQueryParams } from "../address-id-query-params";
import { NameParams } from "../name-params";

export const StudioParamFilters = () =>
  z
    .object({})
    .merge(NameParams(["onnut"]))
    .merge(AddressIdQueryParams());

export default StudioParamFilters;
