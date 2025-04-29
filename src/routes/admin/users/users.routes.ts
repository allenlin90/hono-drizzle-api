import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  insertUserSchema,
  patchUserSchema,
  selectUserSchema,
} from "@/db/schema/user.schema";
import { PREFIX } from "@/constants";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import createErrorSchema from "@/openapi/schemas/create-error-schema";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { IdParams } from "@/openapi/schemas/id-params";
import { NotFoundSchema } from "@/openapi/schemas/not-found";
import { UserParamFilters } from "@/openapi/schemas/users/user-param-filter";
import UnauthorizedSchema from "@/openapi/schemas/unauthorized";

const tags = ["Users"];

export const list = createRoute({
  tags,
  path: "/users",
  method: "get",
  request: {
    query: UserParamFilters,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "user",
        objectSchema: selectUserSchema,
      }),
      "List of users"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/users",
  method: "post",
  request: {
    body: jsonContentRequired(insertUserSchema, "The user to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectUserSchema,
      "The created user"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(UnauthorizedSchema, 'Unauthorized'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertUserSchema),
      "The validation error"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/users/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.USER),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The requested user"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.USER)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "User not found"),
  },
});

export const patch = createRoute({
  tags,
  path: "/users/{id}",
  method: "patch",
  request: {
    params: IdParams(PREFIX.USER),
    body: jsonContentRequired(patchUserSchema, "The user updates"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The updated user"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchUserSchema),
        createErrorSchema(IdParams(PREFIX.USER)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "User not found"),
  },
});

export const remove = createRoute({
  tags,
  path: "/users/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.USER),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The user was deleted",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.USER)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "User not found"),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
