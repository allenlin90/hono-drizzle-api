import { createRouter } from '@/lib/create-app';
import idempotencyKey from '@/validators/idempotency-key';
import * as httpStatusCodes from '@/http-status-codes';
import * as routes from './shows.routes';
import * as handlers from './shows.handlers';

export const router = createRouter();

router.post('/shows/*', idempotencyKey);

/**
 * allow only admin and manager users
 */
router.use(async (c, next) => {
  const jwt = c.var.jwtPayload;

  if (!jwt) {
    return c.json({ message: 'Unauthorized' }, httpStatusCodes.UNAUTHORIZED);
  }

  // TODO: implement route guard for membership RBAC
  if (!jwt.memberships) {
    return c.json({ message: 'Forbidden' }, httpStatusCodes.FORBIDDEN);
  }

  await next();
});

router
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.bulkInsert, handlers.bulkInsert)
  .openapi(routes.bulkUpsert, handlers.bulkUpsert)
  .openapi(routes.patch, handlers.patch);

export default router;
