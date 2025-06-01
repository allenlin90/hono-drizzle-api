import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";

import { PREFIX } from "@/constants";

import { UnauthorizedSchema } from "@/openapi/schemas/status/unauthorized";
import { jsonContent } from "@/openapi/helpers/json-content";
import { jsonContentOneOf } from "@/openapi/helpers/json-content-one-of";
import { PaginatedObjectsSchema } from "@/openapi/schemas/utils/paginated-objects-schema";
import { createErrorSchema } from "@/openapi/schemas/utils/create-error-schema";
import { NotFoundSchema } from "@/openapi/schemas/status/not-found-schema";
import { ShowParamFilters } from "@/openapi/schemas/param-filters/show-param-filters";
// import { IdParams } from "@/openapi/schemas/params/id-params";

// import { selectMaterialSchema } from "@/db/schema/material.schema";
import {
  // showDetailsTransformer,
  ShowTransformer
} from "@/serializers/api/shows/show.serializer";

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
        objectSchema: ShowTransformer,
      }),
      "List of shows"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(ShowParamFilters), NotFoundSchema],
      "Provided query params are not processable"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "MC not found"
    ),
  },
});

// export const getOne = createRoute({
//   tags,
//   path: "/shows/{id}",
//   method: "get",
//   request: {
//     params: IdParams(PREFIX.SHOW),
//   },
//   responses: {
//     [HttpStatusCodes.OK]: jsonContent(
//       showDetailsTransformer,
//       "The requested show"
//     ),
//     [HttpStatusCodes.NOT_FOUND]: jsonContent(
//       NotFoundSchema,
//       "Show not found"
//     ),
//   },
// });

// export const getMaterials = createRoute({
//   tags,
//   path: '/shows/{id}/materials',
//   method: 'get',
//   request: {
//     params: IdParams(PREFIX.SHOW),
//   },
//   responses: {
//     [HttpStatusCodes.OK]: jsonContent(
//       z.object({ materials: z.array(selectMaterialSchema) }),
//       "The requested materials by show ID"
//     ),
//     [HttpStatusCodes.NOT_FOUND]: jsonContent(
//       NotFoundSchema,
//       "Show not found"
//     ),
//   },
// });

export type ListRoute = typeof list;
// export type GetOneRoute = typeof getOne;
// export type GetMaterialsRoute = typeof getMaterials;
