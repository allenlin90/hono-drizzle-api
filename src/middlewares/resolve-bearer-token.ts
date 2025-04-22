import * as jose from 'jose';
import { createMiddleware } from 'hono/factory';

import env from '@/env';
import type { AppBindings } from '@/lib/types';
import type { AuthPayload } from '@/lib/auth/types';
import * as httpStatusCodes from '@/http-status-codes';

// TODO: invalidate cached jwks
const authHost = new URL('http://localhost:3000/api/auth/jwks');
const jwks = jose.createRemoteJWKSet(authHost);

export const resolveBearerToken = createMiddleware<AppBindings>(
  async (c, next) => {
    const authorizationHeader = c.req.header('Authorization');
    const token = authorizationHeader?.split(' ')?.[1];

    if (!token) {
      await next();
      return;
    }

    try {
      if (env.ADMIN_TOKEN?.includes(token)) {
        c.set('isAdmin', true);
      } else {
        const { payload } = await jose.jwtVerify(token, jwks);
        c.set('jwtPayload', payload as AuthPayload);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Invalid token';
      return c.json({ message: errorMessage }, httpStatusCodes.UNAUTHORIZED);
    }

    await next();
  }
);
