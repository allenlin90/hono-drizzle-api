import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  insertPlatformSchema,
  patchPlatformSchema,
} from "@/db/schema/platform.schema";
import { PREFIX } from "@/constants";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import createErrorSchema from "@/openapi/schemas/utils/create-error-schema";
import { PageParams } from "@/openapi/schemas/params/page-params";
import { PaginatedObjectsSchema } from "@/openapi/schemas/utils/paginated-objects-schema";
import { IdParams } from "@/openapi/schemas/params/id-params";
import { NameParams } from "@/openapi/schemas/params/name-params";
import { NotFoundSchema } from "@/openapi/schemas/status/not-found-schema";
import { PlatformSchema } from "@/serializers/admin/platform.serializer";

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
        objectSchema: PlatformSchema,
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
      PlatformSchema,
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
    [HttpStatusCodes.OK]: jsonContent(PlatformSchema, "Platform found"),
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
      PlatformSchema,
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

export const remove = createRoute({
  tags,
  path: "/platforms/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.PLATFORM),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Platform deleted successfully",
    },
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

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
