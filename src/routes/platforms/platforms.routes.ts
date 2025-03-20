import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  insertPlatformSchema,
  patchPlatformSchema,
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

export const getOne = createRoute({
  tags,
  path: "/platforms/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.PLATFORM),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectPlatformSchema, "Platform found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.PLATFORM)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Platform not found"
    ),
  },
});

export const patch = createRoute({
  tags,
  path: "/platforms/{id}",
  method: "patch",
  request: {
    params: IdParams(PREFIX.PLATFORM),
    body: jsonContentRequired(patchPlatformSchema, "Platform to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectPlatformSchema,
      "Platform updated successfully"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchPlatformSchema),
        createErrorSchema(IdParams(PREFIX.PLATFORM)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Platform not found"
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
