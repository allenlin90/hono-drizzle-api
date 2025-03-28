import { createRoute, z } from "@hono/zod-openapi";

import { PREFIX } from "@/constants";
import * as HttpStatusCodes from "@/http-status-codes";

import { jsonContent } from "@/openapi/helpers/json-content";
import { jsonContentOneOf } from "@/openapi/helpers/json-content-one-of";
import { jsonContentRequired } from "@/openapi/helpers/json-content-required";

import { NotFoundSchema } from "@/openapi/schemas/not-found";
import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { createMessageObjectSchema } from "@/openapi/schemas/create-message-object";
import { IdParams } from "@/openapi/schemas/id-params";
import { PatchIdParams } from "@/openapi/schemas/patch-id-params";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";

import { ShowPlatformMaterialParamFiltersSchema } from "@/openapi/schemas/show-platform-materials/show-platform-material-param-filters";
import { showPlatformMaterialSchema } from "@/serializers/show-platform-material.serializer";
import { createShowPlatformMaterialPayloadSchema } from "@/openapi/schemas/show-platform-materials/show-platform-material-payload";
import { selectShowPlatformMaterialSchema } from "@/db/schema/show-platform-material.schema";

const tags = ["Show Platform Materials"];

export const list = createRoute({
  tags,
  path: "/show-platform-materials",
  method: "get",
  request: {
    query: ShowPlatformMaterialParamFiltersSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "show-platform-mc",
        objectSchema: showPlatformMaterialSchema,
      }),
      "List of show platform mcs"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      NotFoundSchema,
      "Provided query params are not processable"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/show-platform-materials",
  method: "post",
  request: {
    body: jsonContentRequired(
      createShowPlatformMaterialPayloadSchema,
      "A material for a show-platform"
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectShowPlatformMaterialSchema,
      "The assigned material for a show-platform"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(createShowPlatformMaterialPayloadSchema),
            createMessageObjectSchema("The show-platform-material exists"),
          ]),
        },
      },
      description: "The validation error",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("show-platform not found"),
      "Associated entity not found"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/show-platform-materials/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.SHOW_PLATFORM_MATERIAL),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      showPlatformMaterialSchema,
      "The requested show-platform-material"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("show-platform-material not found"),
      "Associated entity not found"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [NotFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
