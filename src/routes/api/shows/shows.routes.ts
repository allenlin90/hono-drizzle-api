import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";

import { PREFIX } from "@/constants";

import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { jsonContent } from "@/openapi/helpers/json-content";
import { jsonContentOneOf } from "@/openapi/helpers/json-content-one-of";
import { NotFoundSchema } from "@/openapi/schemas/not-found";
import { ShowPlatformParamFiltersSchema } from "@/openapi/schemas/show-platforms/show-platform-param-filters";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { IdParams } from "@/openapi/schemas/id-params";

import { showTransformer } from "@/serializers/api/shows/show.serializer";

const tags = ["Shows"];

export const list = createRoute({
  tags,
  path: "/shows",
  method: "get",
  request: {
    query: ShowPlatformParamFiltersSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "show",
        objectSchema: showTransformer,
      }),
      "List of shows"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(ShowPlatformParamFiltersSchema), NotFoundSchema],
      "Provided query params are not processable"
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
    [HttpStatusCodes.OK]: jsonContent(
      showTransformer,
      "The requested show"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Show not found"
    ),
  },
});

export type ListRoute = typeof list;
export type GetOneRoute = typeof getOne;