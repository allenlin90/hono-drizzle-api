import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import { PREFIX } from "@/constants";
import {
  insertMcSchema,
  patchMcSchema,
  selectMcSchema,
} from "@/db/schema/mc.schema";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { IdParams } from "@/openapi/schemas/id-params";
import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import notFoundSchema, { NotFoundSchema } from "@/openapi/schemas/not-found";
import createMessageObjectSchema from "@/openapi/schemas/create-message-object";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { McParamFilters } from "@/openapi/schemas/mcs/mc-param-filters";

const tags = ["Mcs"];

export const list = createRoute({
  tags,
  path: "/mcs",
  method: "get",
  request: {
    query: McParamFilters,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "mc",
        objectSchema: selectMcSchema,
      }),
      "List of mcs"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(McParamFilters), notFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/mcs",
  method: "post",
  request: {
    body: jsonContentRequired(insertMcSchema, "The mc to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(selectMcSchema, "The created mc"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertMcSchema),
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Mc not found"),
      "Mc not found"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/mcs/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.MC),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectMcSchema, "The requested mc"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.MC)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Mc not found"),
  },
});

export const patch = createRoute({
  tags,
  path: "/mcs/{id}",
  method: "patch",
  request: {
    params: IdParams(PREFIX.MC),
    body: jsonContentRequired(patchMcSchema, "The mc to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectMcSchema, "The updated mc object"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchMcSchema),
        createErrorSchema(IdParams(PREFIX.MC)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Mc not found"),
  },
});

export const remove = createRoute({
  tags,
  path: "/mcs/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.MC),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The mc was deleted",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.MC)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Mc not found"),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
