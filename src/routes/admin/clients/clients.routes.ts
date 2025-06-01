import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  insertClientSchema,
  patchClientSchema,
} from "@/db/schema/client.schema";
import { PREFIX } from "@/constants";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import createErrorSchema from "@/openapi/schemas/utils/create-error-schema";
import { PaginatedObjectsSchema } from "@/openapi/schemas/utils/paginated-objects-schema";
import { PageParams } from "@/openapi/schemas/params/page-params";
import { IdParams } from "@/openapi/schemas/params/id-params";
import { NameParams } from "@/openapi/schemas/params/name-params";
import { NotFoundSchema } from "@/openapi/schemas/status/not-found-schema";
import { ClientSchema } from '@/serializers/admin/client.serializer';

const tags = ["Clients"];

export const list = createRoute({
  tags,
  path: "/clients",
  method: "get",
  request: {
    query: PageParams().merge(NameParams(["apple", "nike"])),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "client",
        objectSchema: ClientSchema,
      }),
      "List of clients"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/clients",
  method: "post",
  request: {
    body: jsonContentRequired(insertClientSchema, "The client to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      ClientSchema,
      "The created client"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertClientSchema),
      "The validation error"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/clients/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.CLIENT),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ClientSchema, "The requested client"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.CLIENT)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Client not found"),
  },
});

export const patch = createRoute({
  tags,
  path: "/clients/{id}",
  method: "patch",
  request: {
    params: IdParams(PREFIX.CLIENT),
    body: jsonContentRequired(patchClientSchema, "The client updates"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ClientSchema, "The updated client"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchClientSchema),
        createErrorSchema(IdParams(PREFIX.CLIENT)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Client not found"),
  },
});

export const remove = createRoute({
  tags,
  path: "/clients/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.CLIENT),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The client was deleted",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.CLIENT)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Client not found"),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
