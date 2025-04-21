import * as jose from 'jose';
import { createMiddleware } from 'hono/factory';

import type { AppBindings } from '@/lib/types';
import type { AuthPayload } from '@/lib/auth/types';
import * as httpStatusCodes from '@/http-status-codes';

// TODO: invalidate cached jwks
const authHost = new URL('http://localhost:3000/api/auth/jwks');
const jwks = jose.createRemoteJWKSet(authHost);

export const resolveBearerToken = createMiddleware<AppBindings>(
  async (c, next) => {
    const token = c.req.header('Authorization')?.split(' ')?.[1];

    if (token) {
      try {
        const { payload } = await jose.jwtVerify(token, jwks);
        c.set('jwtPayload', payload as AuthPayload);
      } catch (error: any) {
        return c.json(
          { message: error?.message },
          httpStatusCodes.UNAUTHORIZED
        );
      }
    }

    await next();
  }
);
