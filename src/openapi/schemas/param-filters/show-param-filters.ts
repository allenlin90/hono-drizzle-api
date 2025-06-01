import { z } from "@hono/zod-openapi";
import { NameParams } from "../params/name-params";
import { DurationParams } from "../params/duration-params";
import { PageParams } from "../params/page-params";
import {
  clientIdSchema,
  showIdSchema,
  studioRoomIdSchema
} from "../params/id-query-params";

export const ShowParamFilters = PageParams()
  .merge(clientIdSchema)
  .merge(showIdSchema)
  .merge(studioRoomIdSchema)
  .merge(NameParams(["double-eleven", "black-friday"]))
  .merge(DurationParams("Show"));

export type ShowParamFiltersSchema = z.infer<typeof ShowParamFilters>;

export default ShowParamFilters;
