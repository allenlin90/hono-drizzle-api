import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import { PREFIX } from "@/constants";
import { selectBrandMaterialSchema } from "@/db/schema/brand-material.schema";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import { IdParams } from "@/openapi/schemas/id-params";
import { PageParams } from "@/openapi/schemas/page-params";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import notFoundSchema, { NotFoundSchema } from "@/openapi/schemas/not-found";
import createMessageObjectSchema from "@/openapi/schemas/create-message-object";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import MaterialParamFilters from "@/openapi/schemas/brand-materials/brand-materials-filters";

const tags = ["BrandMaterials"];

export const list = createRoute({
  tags,
  path: "/brand-materials",
  method: "get",
  request: {
    query: PageParams().merge(MaterialParamFilters),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "brand_material",
        objectSchema: selectBrandMaterialSchema,
      }),
      "List of brand materials"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(MaterialParamFilters), notFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export type ListRoute = typeof list;
