import { requestId } from "hono/request-id";

import { type AppBindings } from "@/lib/types";
import { notFound } from "@/middlewares/not-found";
import { onError } from "@/middlewares/on-error";
import { pinoLogger } from "@/middlewares/pino-logger";
import { OpenAPIHono } from "@hono/zod-openapi";

export const createRouter = () => {
  return new OpenAPIHono<AppBindings>({ strict: false });
};

export const createApp = () => {
  const app = createRouter();

  app.use(requestId());
  app.use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);

  return app;
};
