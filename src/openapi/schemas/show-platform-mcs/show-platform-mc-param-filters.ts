import { z } from "@hono/zod-openapi";
import { mcIdSchema, showPlatformIdSchema } from "../id-query-params";
import { PageParams } from "../page-params";
import { DurationParams } from "../duration-params";

export const ShowPlatformMcParamFiltersSchema = PageParams()
  .merge(showPlatformIdSchema)
  .merge(DurationParams("Show"))
  .merge(mcIdSchema)
  .merge(
    z.object({
      mc_name: z.string().min(1).optional(),
    })
  );

export default ShowPlatformMcParamFiltersSchema;
