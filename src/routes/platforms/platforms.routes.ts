import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  insertPlatformSchema,
  selectPlatformSchema,
} from "@/db/schema/platform.schema";
import { PREFIX } from "@/constants";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import createErrorSchema from "@/openapi/schemas/create-error-schema";
import { PageParams } from "@/openapi/schemas/page-params";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { IdParams } from "@/openapi/schemas/id-params";
import { NameParams } from "@/openapi/schemas/name-params";
import { NotFoundSchema } from "@/openapi/schemas/not-found";

const tags = ["Platforms"];

export const list = createRoute({
  tags,
  path: "/platforms",
  method: "get",
  request: {
    query: PageParams().merge(NameParams(["tiktok", "youtube"])),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "platform",
        objectSchema: selectPlatformSchema,
      }),
      "List of platforms"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/platforms",
  method: "post",
  request: {
    body: jsonContentRequired(insertPlatformSchema, "Platform to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectPlatformSchema,
      "Platform created successfully"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertPlatformSchema),
      "Validation error"
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
