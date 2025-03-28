import { z } from "@hono/zod-openapi";
import {
  showIdSchema,
  platformIdSchema,
  materialIdSchema,
} from "../id-query-params";
import { PageParams } from "../page-params";
import { materialTypeEnum } from "@/db/schema";

export const ShowPlatformMaterialParamFiltersSchema = PageParams()
  .merge(showIdSchema)
  .merge(platformIdSchema)
  .merge(materialIdSchema)
  .merge(
    z.object({
      material_type: z.enum(materialTypeEnum.enumValues).optional(),
      material_name: z.string().optional(),
      show_name: z.string().optional(),
      platform_name: z.string().optional(),
    })
  );
