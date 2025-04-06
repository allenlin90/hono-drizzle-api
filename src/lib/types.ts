import type { PinoLogger } from "hono-pino";
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

export type AppBindings = {
  Variables: {
    logger: PinoLogger;
  };
};

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;

// Utility to infer the type of values from a Map
export type ValueOfMap<M extends Map<any, any>> = M extends Map<any, infer V>
  ? V
  : never;
