import { z } from "@hono/zod-openapi";
import { PageParams } from "../page-params";
import { DurationParams } from "../duration-params";
import { mcIdSchema, platformIdSchema, showIdSchema } from "../id-query-params";

export const ShowPlatformMcParamFiltersSchema = PageParams()
  .merge(DurationParams("Show"))
  .merge(showIdSchema)
  .merge(platformIdSchema)
  .merge(mcIdSchema)
  .merge(
    z.object({
      mc_name: z.string().min(1).optional(),
    })
  );

export default ShowPlatformMcParamFiltersSchema;
