import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  insertShowSchema,
  patchShowSchema,
  selectShowSchema,
} from "@/db/schema/show.schema";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { IdParams } from "@/openapi/schemas/id-params";
import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import notFoundSchema, { NotFoundSchema } from "@/openapi/schemas/not-found";
import createMessageObjectSchema from "@/openapi/schemas/create-message-object";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { ShowParamFilters } from "@/openapi/schemas/shows/show-param-filters";
import { PREFIX } from "@/constants";

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
        objectSchema: selectShowSchema,
      }),
      "List of shows"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(ShowParamFilters), notFoundSchema],
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
      selectShowSchema,
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
    [HttpStatusCodes.OK]: jsonContent(selectShowSchema, "The requested show"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.SHOW)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Show not found"),
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
      selectShowSchema,
      "The updated show object"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchShowSchema),
        createErrorSchema(IdParams(PREFIX.SHOW)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Show not found"),
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

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
