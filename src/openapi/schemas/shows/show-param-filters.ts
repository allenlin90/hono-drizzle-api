import { z } from "@hono/zod-openapi";
import { PREFIX } from "@/constants";
import { NameParams } from "@/openapi/schemas/name-params";
import DurationParams from "../duration-params";
import IdQueryParams from "../id-query-params";

export const ShowParamFilters = z
  .object({})
  .merge(IdQueryParams({ paramName: "brand_id", prefix: PREFIX.BRAND }))
  .merge(NameParams(["double-eleven", "black-friday"]))
  .merge(DurationParams("Show"));

export type ShowParamFiltersSchema = z.infer<typeof ShowParamFilters>;

export default ShowParamFilters;
