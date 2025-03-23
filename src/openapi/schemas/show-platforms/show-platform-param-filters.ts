import { z } from "@hono/zod-openapi";
import {
  platformIdSchema,
  showIdSchema,
  studioRoomIdSchema,
} from "../id-query-params";
import { PageParams } from "../page-params";
import coerceBoolean from "../coerce-boolean";

export const ShowPlatformParamFiltersSchema = PageParams()
  .merge(platformIdSchema)
  .merge(studioRoomIdSchema)
  .merge(showIdSchema)
  .merge(
    z.object({
      is_active: coerceBoolean.optional(),
    })
  );

export default ShowPlatformParamFiltersSchema;
