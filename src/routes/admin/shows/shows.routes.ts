import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";

import { PREFIX } from "@/constants";
import {
  insertShowSchema,
  patchBulkShowSchema,
  patchShowSchema,
} from "@/db/schema/show.schema";
import { jsonContent } from "@/openapi/helpers/json-content";
import { jsonContentRequired } from "@/openapi/helpers/json-content-required";
import { jsonContentOneOf } from "@/openapi/helpers/json-content-one-of";
import { createErrorSchema } from "@/openapi/schemas/utils/create-error-schema";
import { IdParams } from "@/openapi/schemas/params/id-params";
import { UnauthorizedSchema } from "@/openapi/schemas/status/unauthorized";
import { NotFoundSchema } from "@/openapi/schemas/status/not-found-schema";
import { createMessageObjectSchema } from "@/openapi/schemas/utils/create-message-object-schema";
import { PaginatedObjectsSchema } from "@/openapi/schemas/utils/paginated-objects-schema";
import { ShowParamFilters } from "@/openapi/schemas/param-filters/show-param-filters";
import { ShowSchema } from "@/serializers/admin/shows/show.serializer";

const tags = ["Shows"];

export const list = createRoute({
  tags,
  path: "/shows",
  method: "get",
  request: {
    query: ShowParamFilters,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "show",
        objectSchema: ShowSchema,
      }),
      "List of shows"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(ShowParamFilters), NotFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/shows",
  method: "post",
  request: {
    headers: z.object({
      "Idempotency-Key": z.string().openapi({
        description: "key to ensure idempotency",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
    }),
    body: jsonContentRequired(insertShowSchema, "The show to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      ShowSchema,
      "The created show"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertShowSchema),
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

export const getOne = createRoute({
  tags,
  path: "/shows/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.SHOW),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ShowSchema, "The requested show"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.SHOW)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Show not found"),
  },
});

export const patch = createRoute({
  tags,
  path: "/shows/{id}",
  method: "patch",
  request: {
    params: IdParams(PREFIX.SHOW),
    body: jsonContentRequired(patchShowSchema, "The show to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      ShowSchema,
      "The updated show object"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchShowSchema),
        createErrorSchema(IdParams(PREFIX.SHOW)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Show not found"),
  },
});

export const remove = createRoute({
  tags,
  path: "/shows/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.SHOW),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The show was deleted",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.SHOW)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Show not found"),
  },
});

export const bulkInsert = createRoute({
  tags,
  path: "/shows/bulk",
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
        shows: z.array(insertShowSchema),
      }),
      "The list of shows to create"
    ),
  },
  responses: {
    [HttpStatusCodes.MULTI_STATUS]: jsonContent(
      z.object({
        errors: z.array(
          z.object({
            message: z.string(),
            payload: insertShowSchema,
          })
        ),
        shows: z.array(ShowSchema),
      }),
      "list of created shows"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid idempotency key"),
      "Invalid idempotency key"
    ),
  },
});

export const bulkUpsert = createRoute({
  tags,
  path: "/shows/bulk",
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
        shows: z.array(patchBulkShowSchema),
      }),
      "The list of shows to update"
    ),
  },
  responses: {
    [HttpStatusCodes.MULTI_STATUS]: jsonContent(
      z.object({
        errors: z.array(
          z.object({
            message: z.string(),
            payload: patchBulkShowSchema,
          })
        ),
        shows: z.array(ShowSchema),
      }),
      "list of updated shows"
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
export type BulkUpsertRoute = typeof bulkUpsert;
