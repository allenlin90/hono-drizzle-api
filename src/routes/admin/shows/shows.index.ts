import { createRouter } from '@/lib/create-app';
import idempotencyKey from '@/validators/idempotency-key';
import * as routes from './shows.routes';
import * as handlers from './shows.handlers';
import { routeGuard } from '@/middlewares/route-guard';

export const router = createRouter();

router.post('/shows/*', idempotencyKey);

/**
 * allow only admin and manager users
 */
router.use(routeGuard(['admin']));

router
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.bulkInsert, handlers.bulkInsert)
  .openapi(routes.bulkUpsert, handlers.bulkUpsert)
  .openapi(routes.patch, handlers.patch);

export default router;
