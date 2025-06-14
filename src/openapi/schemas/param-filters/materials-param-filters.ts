import { z } from "@hono/zod-openapi";
import { NameParams } from "@/openapi/schemas/params/name-params";
import { materialTypeEnum } from "@/db/schema/material.schema";
import { coerceBoolean } from "../utils/coerce-boolean";
import { clientIdSchema } from "../params/id-query-params";
import { PageParams } from "../params/page-params";

export const MaterialParamFilters = PageParams()
  .merge(
    z.object({
      type: materialTypeEnum.optional(),
      is_active: coerceBoolean.optional().openapi({
        default: true,
        examples: [true, false, "1", "0"],
        description: "Filter activeness of the object",
      }),
    })
  )
  .merge(clientIdSchema)
  .merge(NameParams(["script", "scene"]));

export type MaterialParamFiltersSchema = z.infer<typeof MaterialParamFilters>;

export default MaterialParamFilters;
