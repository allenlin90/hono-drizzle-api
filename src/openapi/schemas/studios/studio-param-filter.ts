import { z } from "@hono/zod-openapi";
import { addressIdSchema } from "../id-query-params";
import { NameParams } from "../name-params";
import PageParams from "../page-params";

export const StudioParamFilters = PageParams()
  .merge(NameParams(["onnut"]))
  .merge(addressIdSchema);

export default StudioParamFilters;
