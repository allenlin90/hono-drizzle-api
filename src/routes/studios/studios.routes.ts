import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  insertStudioSchema,
  patchStudioSchema,
  selectStudioSchema,
} from "@/db/schema/studio.schema";
import { PREFIX } from "@/constants";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { IdParams } from "@/openapi/schemas/id-params";
import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import { PageParams } from "@/openapi/schemas/page-params";
import notFoundSchema, { NotFoundSchema } from "@/openapi/schemas/not-found";
import createMessageObjectSchema from "@/openapi/schemas/create-message-object";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { NameParams } from "@/openapi/schemas/name-params";
import { StudioParamFilters } from "@/openapi/schemas/studios/studio-param-filter";

const tags = ["Studios"];

export const list = createRoute({
  tags,
  path: "/studios",
  method: "get",
  request: {
    query: PageParams().merge(StudioParamFilters()),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "studio",
        objectSchema: selectStudioSchema,
      }),
      "List of studios"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(NameParams(["onnut studio"])), notFoundSchema],
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
      selectStudioSchema,
      "The created studio"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertStudioSchema),
      "The validation error"
    ),
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
      selectStudioSchema,
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
      selectStudioSchema,
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
      NotFoundSchema,
      "Address not found"
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
