import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  selectCitySchema,
  insertCitySchema,
  patchCitySchema,
} from "@/db/schema/city.schema";
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
import { ShowParamFilters } from "@/openapi/schemas/shows/show-param-filters";
import { PREFIX } from "@/constants";
import NameParams from "@/openapi/schemas/name-params";

const tags = ["Cities"];

export const list = createRoute({
  tags,
  path: "/cities",
  method: "get",
  request: {
    query: PageParams().merge(NameParams(["Bangkok", "Chiang Mai"])),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "city",
        objectSchema: selectCitySchema,
      }),
      "List of shows"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/cities",
  method: "post",
  request: {
    body: jsonContentRequired(insertCitySchema, "The city to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectCitySchema,
      "The created city"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertCitySchema),
      "The validation error"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/cities/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.CITY),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectCitySchema, "The requested city"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.CITY)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "City not found"),
  },
});

export const patch = createRoute({
  tags,
  path: "/cities/{id}",
  method: "patch",
  request: {
    params: IdParams(PREFIX.CITY),
    body: jsonContentRequired(patchCitySchema, "The city updates"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectCitySchema, "The updated city"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchCitySchema),
        createErrorSchema(IdParams(PREFIX.CITY)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "City not found"),
  },
});

export const remove = createRoute({
  tags,
  path: "/cities/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.CITY),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The city was deleted",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.CITY)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "City not found"),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
