import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/types';
import type { Role } from '@/lib/auth/types';
import * as httpStatusCodes from '@/http-status-codes';

export const routeGuard = (roles: [Role, ...Role[]]) =>
  createMiddleware<AppBindings>(async (c, next) => {
    const jwt = c.get('jwtPayload');

    if (!jwt) {
      return c.json({ message: 'Unauthorized' }, httpStatusCodes.UNAUTHORIZED);
    }

    if (!jwt.memberships) {
      return c.json({ message: 'Forbidden' }, httpStatusCodes.FORBIDDEN);
    }

    const userRoles = jwt.memberships.reduce((store, membership) => {
      const roles = membership.role.split(',') as Role[];
      return {
        ...store,
        [membership.organizationId]: [
          ...(store[membership.organizationId] ?? []),
          ...roles,
        ],
      };
    }, {} as Record<string, Role[]>);

    // TODO: check specific user roles by organization
    const uniqueRoles = Array.from(
      new Set(...Object.values(userRoles))
    ) as Role[];

    const hasAccess = uniqueRoles.some((role) => roles.includes(role));

    if (!hasAccess) {
      return c.json({ message: 'Forbidden' }, httpStatusCodes.FORBIDDEN);
    }

    await next();
  });
