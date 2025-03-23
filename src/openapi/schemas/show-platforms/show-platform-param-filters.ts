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
      brand_name: z.string().min(1).optional(),
      platform_name: z.string().min(1).optional(),
      show_name: z.string().min(1).optional(),
      studio_room_name: z.string().min(1).optional(),
    })
  );

export default ShowPlatformParamFiltersSchema;
