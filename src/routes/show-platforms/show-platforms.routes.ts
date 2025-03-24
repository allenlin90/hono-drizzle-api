import { createRoute, z } from "@hono/zod-openapi";

import { PREFIX } from "@/constants";
import * as HttpStatusCodes from "@/http-status-codes";
import { showPlatformSchema } from "@/serializers/show-platform.serializer";
import { selectShowPlatformSchema } from "@/db/schema/show-platform.schema";

import { jsonContent } from "@/openapi/helpers/json-content";
import { jsonContentOneOf } from "@/openapi/helpers/json-content-one-of";
import { jsonContentRequired } from "@/openapi/helpers/json-content-required";

import { NotFoundSchema } from "@/openapi/schemas/not-found";
import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { createMessageObjectSchema } from "@/openapi/schemas/create-message-object";
import { IdParams } from "@/openapi/schemas/id-params";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { ShowPlatformPayloadSchema } from "@/openapi/schemas/show-platforms/show-platform-payload";
import { ShowPlatformParamFiltersSchema } from "@/openapi/schemas/show-platforms/show-platform-param-filters";

const tags = ["Show Platforms"];

export const list = createRoute({
  tags,
  path: "/show-platforms",
  method: "get",
  request: {
    query: ShowPlatformParamFiltersSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "show-platform",
        objectSchema: showPlatformSchema,
      }),
      "List of show platforms"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(showPlatformSchema), NotFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/show-platforms",
  method: "post",
  request: {
    headers: z.object({
      "Idempotency-Key": z.string().openapi({
        description: "key to ensure idempotency",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
    }),
    body: jsonContentRequired(
      ShowPlatformPayloadSchema,
      "The show platform to create"
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectShowPlatformSchema,
      "The created show-platform"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ShowPlatformPayloadSchema),
      "The validation error"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid idempotency key"),
      "Invalid idempotency key"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContentOneOf(
      [
        createMessageObjectSchema("Platform not found"),
        createMessageObjectSchema("Show not found"),
        createMessageObjectSchema("Studio room not found"),
      ],
      "Associated entity not found"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/show-platforms/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.SHOW_PLATFORM),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      showPlatformSchema,
      "The requested show-platform"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.SHOW_PLATFORM)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Show-platform not found"
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
