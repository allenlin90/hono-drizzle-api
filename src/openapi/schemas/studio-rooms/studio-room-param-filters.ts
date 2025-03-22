import { z } from "@hono/zod-openapi";
import { PageParams } from "../page-params";
import { NameParams } from "../name-params";
import { studioIdSchema } from "../id-query-params";

export const StudioRoomParamFilters = PageParams()
  .merge(NameParams(["301", "401"]))
  .merge(
    z.object({
      room_type: z
        .union([z.literal("s"), z.literal("m"), z.literal("l")])
        .optional(),
    })
  )
  .merge(studioIdSchema);

export default StudioRoomParamFilters;
