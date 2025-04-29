import type { ReturningObjectType } from "@/openapi/schemas/helpers/uid-validators";

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
import { ShowPlatformMcParamFiltersSchema } from "@/openapi/schemas/show-platform-mcs/show-platform-mc-param-filters";
import { showPlatformMcSchema } from "@/serializers/admin/show-platform-mcs/show-platform-mc.serializer";
import {
  insertShowPlatformMcSchema,
  patchBulkShowPlatformMcSchema,
  selectShowPlatformMcSchema,
} from "@/db/schema/show-platform-mc.schema";
import {
  createShowPlatformMcPayloadSchema,
  patchShowPlatformMcPayloadSchema,
} from "@/openapi/schemas/show-platform-mcs/show-platform-mc-payload";

const tags = ["Show Platform Mcs"];

export const list = createRoute({
  tags,
  path: "/show-platform-mcs",
  method: "get",
  request: {
    query: ShowPlatformMcParamFiltersSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "show-platform-mc",
        objectSchema: showPlatformMcSchema,
      }),
      "List of show platform mcs"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [NotFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/show-platform-mcs",
  method: "post",
  request: {
    body: jsonContentRequired(
      createShowPlatformMcPayloadSchema,
      "The MC assigns to show-platform"
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectShowPlatformMcSchema,
      "The created show-platform-mc"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(createShowPlatformMcPayloadSchema),
            createMessageObjectSchema("The show-platform-mc exists"),
          ]),
        },
      },
      description: "The validation error",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("show-platform/mc not found"),
      "Associated entity not found"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/show-platform-mcs/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.SHOW_PLATFORM_MC),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      showPlatformMcSchema,
      "The requested show-platform-mc"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Show-platform-mc not found"
    ),
  },
});

export const patch = createRoute({
  tags,
  path: "/show-platform-mcs/{id}",
  method: "patch",
  request: {
    params: PatchIdParams<ReturningObjectType<"show_platform_mc">>({
      object: "show_platform_mc",
    }),
    body: jsonContentRequired(
      patchShowPlatformMcPayloadSchema,
      "The show-platform-mc to update"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectShowPlatformMcSchema,
      "The updated show-platform-mc object"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(patchShowPlatformMcPayloadSchema),
            createMessageObjectSchema("invalid show-platform"),
          ]),
        },
      },
      description: "The validation error",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Show-platform-mc not found"
    ),
  },
});

export const remove = createRoute({
  tags,
  path: "/show-platform-mcs/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.SHOW_PLATFORM_MC),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The show-platform-mc was deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Show-platform-mc not found"
    ),
  },
});

export const bulkInsert = createRoute({
  tags,
  path: "/show-platform-mcs/bulk",
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
        show_platform_mcs: z.array(insertShowPlatformMcSchema),
      }),
      "The show-platform-mc to create"
    ),
  },
  responses: {
    [HttpStatusCodes.MULTI_STATUS]: jsonContent(
      z.object({
        errors: z.array(
          z.object({
            message: z.string(),
            payload: insertShowPlatformMcSchema,
          })
        ),
        show_platform_mcs: z.array(selectShowPlatformMcSchema),
      }),
      "list of created show-platform-mcs"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid idempotency key"),
      "Invalid idempotency key"
    ),
  },
});

export const bulkUpdate = createRoute({
  tags,
  path: "/show-platform-mcs/bulk",
  method: "patch",
  request: {
    body: jsonContentRequired(
      z.object({
        show_platform_mcs: z.array(patchBulkShowPlatformMcSchema),
      }),
      "The list of show-platform-mc to update"
    ),
  },
  responses: {
    [HttpStatusCodes.MULTI_STATUS]: jsonContent(
      z.object({
        errors: z.array(
          z.object({
            message: z.string(),
            payload: patchBulkShowPlatformMcSchema,
          })
        ),
        show_platform_mcs: z.array(selectShowPlatformMcSchema),
      }),
      "list of updated show-platform-mcs"
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
