import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "@/lib/create-app";
import * as HttpStatus from "@/http-status-codes";
import jsonContent from "@/openapi/helpers/json-content";
import { createMessageObjectSchema } from "@/openapi/schemas/create-message-object";

const router = createRouter().openapi(
  createRoute({
    tags: ["Index"],
    method: "get",
    path: "/",
    responses: {
      [HttpStatus.OK]: jsonContent(
        createMessageObjectSchema("Livestream Studio API"),
        "Livestream Studio API Index"
      ),
    },
  }),
  (c) => {
    return c.json({ message: "Livestream Studio API" }, HttpStatus.OK);
  }
);

export default router;
