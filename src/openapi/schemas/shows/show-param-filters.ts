import { z } from "@hono/zod-openapi";
import { NameParams } from "@/openapi/schemas/name-params";
import DurationParams from "../duration-params";
import BrandIdQueryParams from "../brand-id-query-params";

export const ShowParamFilters = z
  .object({})
  .merge(BrandIdQueryParams())
  .merge(NameParams(["double-eleven", "black-friday"]))
  .merge(DurationParams("Show"));

export type ShowParamFiltersSchema = z.infer<typeof ShowParamFilters>;

export default ShowParamFilters;
