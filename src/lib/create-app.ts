import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { OpenAPIHono } from '@hono/zod-openapi';

import type { AppBindings } from '@/lib/types';
import { notFound } from '@/middlewares/not-found';
import { onError } from '@/middlewares/on-error';
import { pinoLogger } from '@/middlewares/pino-logger';
import { defaultHook } from '@/openapi/default-hook';
import { resolveBearerToken } from '@/middlewares/resolve-bearer-token';

export const createRouter = () => {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
};

export const createApp = () => {
  const app = createRouter();

  app.use('*', cors());
  app.use('*', secureHeaders({}));
  app.use(requestId());
  // app.use(pinoLogger());
  app.use('*', resolveBearerToken);

  app.notFound(notFound);
  app.onError(onError);

  return app;
};
