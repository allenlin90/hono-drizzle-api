import type { ReturningObjectType } from "@/openapi/schemas/helpers/uid-validators";

import { createRoute, z } from "@hono/zod-openapi";

import { PREFIX } from "@/constants";
import * as HttpStatusCodes from "@/http-status-codes";
import { showPlatformSchema } from "@/serializers/show-platforms/show-platform.serializer";
import {
  insertShowPlatformSchema,
  patchBulkShowPlatformSchema,
  selectShowPlatformSchema,
} from "@/db/schema/show-platform.schema";

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
import {
  createShowPlatformPayloadSchema,
  updateShowPlatformPayloadSchema,
} from "@/openapi/schemas/show-platforms/show-platform-payload";
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
      createShowPlatformPayloadSchema,
      "The show platform to create"
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectShowPlatformSchema,
      "The created show-platform"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(createShowPlatformPayloadSchema),
            createMessageObjectSchema("The show-platform exists"),
          ]),
        },
      },
      description: "The validation error",
    },
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid idempotency key"),
      "Invalid idempotency key"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("platform/show/studio-room not found"),
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

export const patch = createRoute({
  tags,
  path: "/show-platforms/{id}",
  method: "patch",
  request: {
    params: PatchIdParams<ReturningObjectType<"show_platform">>({
      object: "show_platform",
    }),
    body: jsonContentRequired(
      updateShowPlatformPayloadSchema,
      "The show-platform to update"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectShowPlatformSchema,
      "The updated show-platform object"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(updateShowPlatformPayloadSchema),
        createErrorSchema(IdParams(PREFIX.SHOW_PLATFORM)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Show-platform not found"
    ),
  },
});

export const remove = createRoute({
  tags,
  path: "/show-platforms/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.SHOW_PLATFORM),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The show-platform was deleted",
    },
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

export const bulkInsert = createRoute({
  tags,
  path: "/show-platforms/bulk",
  method: "post",
  request: {
    headers: z.object({
      "Idempotency-Key": z.string().openapi({
        description: "key to ensure idempotency",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
    }),
    body: jsonContentRequired(
      z.object({
        show_platforms: z.array(insertShowPlatformSchema),
      }),
      "The list of show platforms to create"
    ),
  },
  responses: {
    [HttpStatusCodes.MULTI_STATUS]: jsonContent(
      z.object({
        errors: z.array(
          z.object({
            message: z.string(),
            payload: insertShowPlatformSchema,
          })
        ),
        showPlatforms: z.array(selectShowPlatformSchema),
      }),
      "list of created show-platforms"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid idempotency key"),
      "Invalid idempotency key"
    ),
  },
});

export const bulkUpdate = createRoute({
  tags,
  path: "/show-platforms/bulk",
  method: "patch",
  request: {
    headers: z.object({
      "Idempotency-Key": z.string().openapi({
        description: "key to ensure idempotency",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
    }),
    body: jsonContentRequired(
      z.object({
        show_platforms: z.array(patchBulkShowPlatformSchema),
      }),
      "The list of show platforms to update"
    ),
  },
  responses: {
    [HttpStatusCodes.MULTI_STATUS]: jsonContent(
      z.object({
        errors: z.array(
          z.object({
            message: z.string(),
            payload: patchBulkShowPlatformSchema,
          })
        ),
        showPlatforms: z.array(selectShowPlatformSchema),
      }),
      "list of updated show-platforms"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid idempotency key"),
      "Invalid idempotency key"
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
export type BulkInsertRoute = typeof bulkInsert;
export type BulkUpdateRoute = typeof bulkUpdate;
