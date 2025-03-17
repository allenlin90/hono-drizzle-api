import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import createErrorSchema from "@/openapi/schemas/create-error-schema";
import { IdParams } from "@/openapi/schemas/id-params";
import {
  insertBrandSchema,
  selectBrandsSchema,
} from "@/db/schema/brand.schema";
import { PREFIX } from "@/constants";
import notFoundSchema from "@/openapi/schemas/not-found";

const tags = ["Brands"];

export const list = createRoute({
  tags,
  path: "/brands",
  method: "get",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectBrandsSchema),
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
      createErrorSchema(insertBrandSchema),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Brand not found"),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
