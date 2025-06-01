import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  insertCitySchema,
  patchCitySchema,
} from "@/db/schema/city.schema";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import { IdParams } from "@/openapi/schemas/params/id-params";
import { UnauthorizedSchema } from "@/openapi/schemas/status/unauthorized";
import { PageParams } from "@/openapi/schemas/params/page-params";
import { NotFoundSchema } from "@/openapi/schemas/status/not-found-schema";
import { createErrorSchema } from "@/openapi/schemas/utils/create-error-schema";
import { PaginatedObjectsSchema } from "@/openapi/schemas/utils/paginated-objects-schema";
import { PREFIX } from "@/constants";
import { NameParams } from "@/openapi/schemas/params/name-params";
import { CitySchema } from "@/serializers/admin/city.serializer";

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
        objectSchema: CitySchema,
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
      CitySchema,
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
    [HttpStatusCodes.OK]: jsonContent(CitySchema, "The requested city"),
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
    [HttpStatusCodes.OK]: jsonContent(CitySchema, "The updated city"),
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
