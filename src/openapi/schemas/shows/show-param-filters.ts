import { z } from "@hono/zod-openapi";
import { NameParams } from "../name-params";
import DurationParams from "../duration-params";
import { brandIdSchema } from "../id-query-params";
import { PageParams } from "../page-params";

export const ShowParamFilters = PageParams()
  .merge(brandIdSchema)
  .merge(NameParams(["double-eleven", "black-friday"]))
  .merge(DurationParams("Show"));

export type ShowParamFiltersSchema = z.infer<typeof ShowParamFilters>;

export default ShowParamFilters;
