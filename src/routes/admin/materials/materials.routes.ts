import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import { PREFIX } from "@/constants";
import {
  insertMaterialSchema,
  patchMaterialSchema,
} from "@/db/schema/material.schema";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import { IdParams } from "@/openapi/schemas/params/id-params";
import { createErrorSchema } from "@/openapi/schemas/utils/create-error-schema";
import { UnauthorizedSchema } from "@/openapi/schemas/status/unauthorized";
import { NotFoundSchema } from "@/openapi/schemas/status/not-found-schema";
import createMessageObjectSchema from "@/openapi/schemas/utils/create-message-object-schema";
import { PaginatedObjectsSchema } from "@/openapi/schemas/utils/paginated-objects-schema";
import { MaterialParamFilters } from "@/openapi/schemas/param-filters/materials-param-filters";
import { MaterialSchema } from "@/serializers/admin/material.serializer";

const tags = ["Materials"];

export const list = createRoute({
  tags,
  path: "/materials",
  method: "get",
  request: {
    query: MaterialParamFilters,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "material",
        objectSchema: MaterialSchema,
      }),
      "List of  materials"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(MaterialParamFilters), NotFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/materials",
  method: "post",
  request: {
    headers: z.object({
      "Idempotency-Key": z.string().openapi({
        description: "key to ensure idempotency",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
    }),
    body: jsonContentRequired(
      insertMaterialSchema,
      "The material to create"
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      MaterialSchema,
      "The created material"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertMaterialSchema),
      "The validation error"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid idempotency key"),
      "Invalid idempotency key"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Client not found"),
      "Client not found"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/materials/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.MATERIAL),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      MaterialSchema,
      "The requested material"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.MATERIAL)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Material not found"
    ),
  },
});

export const patch = createRoute({
  tags,
  path: "/materials/{id}",
  method: "patch",
  request: {
    params: IdParams(PREFIX.MATERIAL),
    body: jsonContentRequired(
      patchMaterialSchema,
      "The material to update"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      MaterialSchema,
      "The updated material object"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchMaterialSchema),
        createErrorSchema(IdParams(PREFIX.MATERIAL)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Material not found"
    ),
  },
});

export const remove = createRoute({
  tags,
  path: "/materials/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.MATERIAL),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The brand material was deleted",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.MATERIAL)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NotFoundSchema,
      "Brand material not found"
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
