import { createRoute } from "@hono/zod-openapi";

import * as HttpStatusCodes from "@/http-status-codes";

const tags = ["Users"];

export const verify = createRoute({
  tags,
  path: "/users/verify",
  method: "post",
  description: "Lookup and create the user from credentials if it does'nt exist",
  responses: {
    [HttpStatusCodes.OK]: {
      description: "The user exists",
    },
    [HttpStatusCodes.CREATED]: {
      description: "The user is created",
    }
  },
});

export type VerifyRoute = typeof verify;