import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import { PREFIX } from "@/constants";
import {
  insertOperatorSchema,
  patchOperatorSchema,
  selectOperatorSchema,
} from "@/db/schema/operator.schema";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { IdParams } from "@/openapi/schemas/id-params";
import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import notFoundSchema, { NotFoundSchema } from "@/openapi/schemas/not-found";
import createMessageObjectSchema from "@/openapi/schemas/create-message-object";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { OperatorParamFilters } from "@/openapi/schemas/operators/operator-param-filters";

const tags = ["Operators"];

export const list = createRoute({
  tags,
  path: "/operators",
  method: "get",
  request: {
    query: OperatorParamFilters,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "operator",
        objectSchema: selectOperatorSchema,
      }),
      "List of operators"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(OperatorParamFilters), notFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/operators",
  method: "post",
  request: {
    body: jsonContentRequired(insertOperatorSchema, "The operators to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectOperatorSchema,
      "The created operators"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertOperatorSchema),
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Operators not found"),
      "Operators not found"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/operators/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.OPERATOR),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectOperatorSchema,
      "The requested operator"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.OPERATOR)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Operator not found"
    ),
  },
});

export const patch = createRoute({
  tags,
  path: "/operators/{id}",
  method: "patch",
  request: {
    params: IdParams(PREFIX.OPERATOR),
    body: jsonContentRequired(patchOperatorSchema, "The operator to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectOperatorSchema,
      "The updated operator object"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchOperatorSchema),
        createErrorSchema(IdParams(PREFIX.OPERATOR)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Operator not found"
    ),
  },
});

export const remove = createRoute({
  tags,
  path: "/operators/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.OPERATOR),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The operator was deleted",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.OPERATOR)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Operator not found"
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
