import { Hono } from "hono";
import { requestId } from "hono/request-id";

import { notFound } from "@/middlewares/not-found";
import { onError } from "@/middlewares/on-error";
import { pinoLogger } from "@/middlewares/pino-logger";
import { type AppBindings } from "@/lib/types";

export const createApp = () => {
  const app = new Hono<AppBindings>({ strict: false });

  app.use(requestId());
  app.use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);

  return app;
};
