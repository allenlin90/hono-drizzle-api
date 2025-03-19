import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import { selectShowSchema } from "@/db/schema/show.schema";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { IdParams } from "@/openapi/schemas/id-params";
import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import { PageParams } from "@/openapi/schemas/page-params";
import notFoundSchema from "@/openapi/schemas/not-found";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { ShowParamFilters } from "@/openapi/schemas/shows/show-param-filters";

const tags = ["Shows"];

export const list = createRoute({
  tags,
  path: "/shows",
  method: "get",
  request: {
    query: PageParams().merge(ShowParamFilters),
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
      [notFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export type ListRoute = typeof list;
