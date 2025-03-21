import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import { PREFIX } from "@/constants";
import {
  insertBrandMaterialSchema,
  selectBrandMaterialSchema,
} from "@/db/schema/brand-material.schema";
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

export const create = createRoute({
  tags,
  path: "/brand-materials",
  method: "post",
  request: {
    headers: z.object({
      "Idempotency-Key": z.string().openapi({
        description: "key to ensure idempotency",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
    }),
    body: jsonContentRequired(
      insertBrandMaterialSchema,
      "The brand material to create"
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectBrandMaterialSchema,
      "The created brand material"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertBrandMaterialSchema),
      "The validation error"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid idempotency key"),
      "Invalid idempotency key"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Brand not found"),
      "Brand not found"
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
