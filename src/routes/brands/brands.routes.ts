import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  insertBrandSchema,
  patchBrandSchema,
  selectBrandsSchema,
} from "@/db/schema/brand.schema";
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

const tags = ["Brands"];

export const list = createRoute({
  tags,
  path: "/brands",
  method: "get",
  request: {
    query: PageParams().merge(NameParams(["apple", "nike"])),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "brand",
        objectSchema: selectBrandsSchema,
      }),
      "List of brands"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/brands",
  method: "post",
  request: {
    body: jsonContentRequired(insertBrandSchema, "The brand to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectBrandsSchema,
      "The created brand"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertBrandSchema),
      "The validation error"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/brands/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.BRAND),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectBrandsSchema,
      "The requested brand"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.BRAND)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Brand not found"),
  },
});

export const patch = createRoute({
  tags,
  path: "/brands/{id}",
  method: "patch",
  request: {
    params: IdParams(PREFIX.BRAND),
    body: jsonContentRequired(patchBrandSchema, "The brand updates"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectBrandsSchema, "The updated brand"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchBrandSchema),
        createErrorSchema(IdParams(PREFIX.BRAND)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Brand not found"),
  },
});

export const remove = createRoute({
  tags,
  path: "/brands/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.BRAND),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The brand was deleted",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.BRAND)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(NotFoundSchema, "Brand not found"),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
