import { z } from "@hono/zod-openapi";
import { NameParams } from "@/openapi/schemas/name-params";
import { brandMaterialTypeEnum } from "@/db/schema/brand-material.schema";
import BrandIdQueryParams from "../brand-id-query-params";
import coerceBoolean from "../coerce-boolean";

export const MaterialParamFilters = z
  .object({
    type: brandMaterialTypeEnum,
    is_active: coerceBoolean.optional().openapi({
      default: true,
      examples: [true, false, "1", "0"],
      description: "Filter activeness of the object",
    }),
  })
  .merge(BrandIdQueryParams())
  .merge(NameParams(["script", "scene"]));

export type MaterialParamFiltersSchema = z.infer<typeof MaterialParamFilters>;

export default MaterialParamFilters;
