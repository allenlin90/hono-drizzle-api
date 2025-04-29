import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  insertAddressSchema,
  patchAddressSchema,
  selectAddressSchema,
} from "@/db/schema/address.schema";
import { PREFIX } from "@/constants";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { IdParams } from "@/openapi/schemas/id-params";
import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import notFoundSchema, { NotFoundSchema } from "@/openapi/schemas/not-found";
import createMessageObjectSchema from "@/openapi/schemas/create-message-object";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import { AddressParamFilters } from "@/openapi/schemas/addresses/address-param-filters";

const tags = ["Addresses"];

export const list = createRoute({
  tags,
  path: "/addresses",
  method: "get",
  request: {
    query: AddressParamFilters,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "address",
        objectSchema: selectAddressSchema,
      }),
      "List of addresses"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(AddressParamFilters), notFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/addresses",
  method: "post",
  request: {
    body: jsonContentRequired(insertAddressSchema, "The address to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectAddressSchema,
      "The created show"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertAddressSchema),
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("City not found"),
      "City not found"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/addresses/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.ADDRESS),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectAddressSchema,
      "The requested address"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.ADDRESS)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Address not found"
    ),
  },
});

export const patch = createRoute({
  tags,
  path: "/addresses/{id}",
  method: "patch",
  request: {
    params: IdParams(PREFIX.ADDRESS),
    body: jsonContentRequired(patchAddressSchema, "The show to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectAddressSchema,
      "The updated address object"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchAddressSchema),
        createErrorSchema(IdParams(PREFIX.ADDRESS)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "City not found"),
  },
});

export const remove = createRoute({
  tags,
  path: "/addresses/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.ADDRESS),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The address was deleted",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.ADDRESS)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "City not found"),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
