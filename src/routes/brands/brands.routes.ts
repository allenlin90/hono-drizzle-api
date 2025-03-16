import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";
import { objectTimestamps } from "@/openapi/helpers/object-timestamps";

const tags = ["Brands"];

export const list = createRoute({
  tags,
  path: "/brands",
  method: "get",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(
        z.object({
          id: z.number(),
          uid: z.string(),
          name: z.string(),
          ...objectTimestamps(),
        })
      ),
      "List of brands"
    ),
  },
});

export type ListRoute = typeof list;
