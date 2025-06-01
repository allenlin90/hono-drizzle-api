import { z } from "@hono/zod-openapi";
import {
  platformIdSchema,
  showIdSchema,
} from "../params/id-query-params";
import { PageParams } from "../params/page-params";
import { coerceBoolean } from "../utils/coerce-boolean";

export const ShowPlatformParamFiltersSchema = PageParams()
  .merge(platformIdSchema)
  .merge(showIdSchema)
  .merge(
    z.object({
      is_active: coerceBoolean.optional(),
      platform_name: z.string().min(1).optional(),
      show_name: z.string().min(1).optional(),
      ext_id: z.string().min(1).optional(),
    })
  );

export default ShowPlatformParamFiltersSchema;
