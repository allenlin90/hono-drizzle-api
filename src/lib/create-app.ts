import { requestId } from "hono/request-id";

import { type AppBindings } from "@/lib/types";
import { notFound } from "@/middlewares/not-found";
import { onError } from "@/middlewares/on-error";
import { pinoLogger } from "@/middlewares/pino-logger";
import { OpenAPIHono } from "@hono/zod-openapi";

export const createApp = () => {
  const app = new OpenAPIHono<AppBindings>({ strict: false });

  app.use(requestId());
  app.use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);

  return app;
};
