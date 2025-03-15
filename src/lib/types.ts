import type { PinoLogger } from "hono-pino";
import type { OpenAPIHono } from "@hono/zod-openapi";

export type AppBindings = {
  Variables: {
    logger: PinoLogger;
  };
};

export type AppOpenAPI = OpenAPIHono<AppBindings>;
