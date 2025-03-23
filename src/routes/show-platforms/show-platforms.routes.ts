import { createRoute, z } from "@hono/zod-openapi";

import * as HttpStatusCodes from "@/http-status-codes";
import { showPlatformSchema } from "@/serializers/show-platform.serializer";

import { jsonContent } from "@/openapi/helpers/json-content";
import { jsonContentOneOf } from "@/openapi/helpers/json-content-one-of";

import { NotFoundSchema } from "@/openapi/schemas/not-found";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import { ShowPlatformParamFiltersSchema } from "@/openapi/schemas/show-platforms/show-platform-param-filters";

const tags = ["Show Platforms"];

export const list = createRoute({
  tags,
  path: "/show-platforms",
  method: "get",
  request: {
    query: ShowPlatformParamFiltersSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "show-platform",
        objectSchema: showPlatformSchema,
      }),
      "List of show platforms"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(showPlatformSchema), NotFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export type ListRoute = typeof list;
