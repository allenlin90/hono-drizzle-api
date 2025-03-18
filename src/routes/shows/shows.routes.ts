import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import createErrorSchema from "@/openapi/schemas/create-error-schema";
import { IdParams } from "@/openapi/schemas/id-params";
import { PageParams } from "@/openapi/schemas/page-params";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { selectShowSchema } from "@/db/schema/show.schema";
import { PREFIX } from "@/constants";
import notFoundSchema from "@/openapi/schemas/not-found";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";

const tags = ["Shows"];

export const list = createRoute({
  tags,
  path: "/shows",
  method: "get",
  request: {
    query: PageParams(),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "show",
        objectSchema: selectShowSchema,
      }),
      "List of shows"
    ),
  },
});

export type ListRoute = typeof list;
