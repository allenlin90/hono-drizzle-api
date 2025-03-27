import { createRoute, z } from "@hono/zod-openapi";

import { PREFIX } from "@/constants";
import * as HttpStatusCodes from "@/http-status-codes";

import { jsonContent } from "@/openapi/helpers/json-content";
import { jsonContentOneOf } from "@/openapi/helpers/json-content-one-of";
import { jsonContentRequired } from "@/openapi/helpers/json-content-required";

import { NotFoundSchema } from "@/openapi/schemas/not-found";
import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { createMessageObjectSchema } from "@/openapi/schemas/create-message-object";
import { IdParams } from "@/openapi/schemas/id-params";
import { PatchIdParams } from "@/openapi/schemas/patch-id-params";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { ShowPlatformMcParamFiltersSchema } from "@/openapi/schemas/show-platform-mcs/show-platform-mc-param-filters";
import { showPlatformMcSchema } from "@/serializers/show-platform-mc.serializer";
import {
  insertShowPlatformMcSchema,
  selectShowPlatformMcSchema,
} from "@/db/schema/show-platform-mc.schema";
import { createShowPlatformMcPayloadSchema } from "@/openapi/schemas/show-platform-mcs/show-platform-mc-payload";

const tags = ["Show Platform Mcs"];

export const list = createRoute({
  tags,
  path: "/show-platform-mcs",
  method: "get",
  request: {
    query: ShowPlatformMcParamFiltersSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "show-platform-mc",
        objectSchema: showPlatformMcSchema,
      }),
      "List of show platform mcs"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [NotFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/show-platform-mcs",
  method: "post",
  request: {
    body: jsonContentRequired(
      createShowPlatformMcPayloadSchema,
      "The MC assigns to show-platform"
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectShowPlatformMcSchema,
      "The created show-platform-mc"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: {
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(insertShowPlatformMcSchema),
            createMessageObjectSchema("The show-platform-mc exists"),
          ]),
        },
      },
      description: "The validation error",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("show-platform/mc not found"),
      "Associated entity not found"
    ),
  },
});

// export const getOne = createRoute({
//   tags,
//   path: "/show-platforms/{id}",
//   method: "get",
//   request: {
//     params: IdParams(PREFIX.SHOW_PLATFORM),
//   },
//   responses: {
//     [HttpStatusCodes.OK]: jsonContent(
//       showPlatformSchema,
//       "The requested show-platform"
//     ),
//     [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
//       createErrorSchema(IdParams(PREFIX.SHOW_PLATFORM)),
//       "invalid id error"
//     ),
//     [HttpStatusCodes.NOT_FOUND]: jsonContent(
//       NotFoundSchema,
//       "Show-platform not found"
//     ),
//   },
// });

// export const patch = createRoute({
//   tags,
//   path: "/show-platforms/{id}",
//   method: "patch",
//   request: {
//     params: PatchIdParams<ReturningObjectType<"show_platform">>({
//       object: "show_platform",
//     }),
//     body: jsonContentRequired(
//       updateShowPlatformPayloadSchema,
//       "The show-platform to update"
//     ),
//   },
//   responses: {
//     [HttpStatusCodes.OK]: jsonContent(
//       selectShowPlatformSchema,
//       "The updated show-platform object"
//     ),
//     [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
//       [
//         createErrorSchema(updateShowPlatformPayloadSchema),
//         createErrorSchema(IdParams(PREFIX.SHOW_PLATFORM)),
//       ],
//       "The validation error"
//     ),
//     [HttpStatusCodes.NOT_FOUND]: jsonContent(
//       NotFoundSchema,
//       "Show-platform not found"
//     ),
//   },
// });

// export const remove = createRoute({
//   tags,
//   path: "/show-platforms/{id}",
//   method: "delete",
//   request: {
//     params: IdParams(PREFIX.SHOW_PLATFORM),
//   },
//   responses: {
//     [HttpStatusCodes.NO_CONTENT]: {
//       description: "The show-platform was deleted",
//     },
//     [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
//       createErrorSchema(IdParams(PREFIX.SHOW_PLATFORM)),
//       "invalid id error"
//     ),
//     [HttpStatusCodes.NOT_FOUND]: jsonContent(
//       NotFoundSchema,
//       "Show-platform not found"
//     ),
//   },
// });

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
// export type GetOneRoute = typeof getOne;
// export type PatchRoute = typeof patch;
// export type RemoveRoute = typeof remove;
