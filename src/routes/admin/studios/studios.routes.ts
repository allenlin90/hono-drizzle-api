import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  insertStudioSchema,
  patchStudioSchema,
} from "@/db/schema/studio.schema";
import { PREFIX } from "@/constants";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import { createErrorSchema } from "@/openapi/schemas/utils/create-error-schema";
import { IdParams } from "@/openapi/schemas/params/id-params";
import { UnauthorizedSchema } from "@/openapi/schemas/status/unauthorized";
import notFoundSchema from "@/openapi/schemas/status/not-found-schema";
import createMessageObjectSchema from "@/openapi/schemas/utils/create-message-object-schema";
import { PaginatedObjectsSchema } from "@/openapi/schemas/utils/paginated-objects-schema";
import { StudioParamFilters } from "@/openapi/schemas/param-filters/studio-param-filter";
import { StudioSchema } from "@/serializers/admin/studio.serializer";

const tags = ["Studios"];

export const list = createRoute({
  tags,
  path: "/studios",
  method: "get",
  request: {
    query: StudioParamFilters,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "studio",
        objectSchema: StudioSchema,
      }),
      "List of studios"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(StudioParamFilters), notFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/studios",
  method: "post",
  request: {
    body: jsonContentRequired(insertStudioSchema, "The studio to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      StudioSchema,
      "The created studio"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(insertStudioSchema),
            createMessageObjectSchema("The studio exists"),
          ]),
        },
      },
      description: "The validation error",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Address not found"),
      "Address not found"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/studios/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.STUDIO),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      StudioSchema,
      "The requested studio"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.STUDIO)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Studio not found"
    ),
  },
});

export const patch = createRoute({
  tags,
  path: "/studios/{id}",
  method: "patch",
  request: {
    params: IdParams(PREFIX.STUDIO),
    body: jsonContentRequired(patchStudioSchema, "The studio to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      StudioSchema,
      "The updated studio object"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchStudioSchema),
        createErrorSchema(IdParams(PREFIX.STUDIO)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Address not found"
    ),
  },
});

export const remove = createRoute({
  tags,
  path: "/studios/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.STUDIO),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The studio was deleted",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.STUDIO)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Address not found"
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
