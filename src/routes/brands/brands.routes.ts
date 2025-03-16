import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";
import { objectTimestamps } from "@/openapi/helpers/object-timestamps";
import { selectBrandsSchema } from "@/db/schema/brand.schema";

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

export type ListRoute = typeof list;
