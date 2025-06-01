import { createRouter } from '@/lib/create-app';
import idempotencyKey from '@/validators/idempotency-key';
import * as routes from './shows.routes';
import * as handlers from './shows.handlers';
import { routeGuard } from '@/middlewares/route-guard';

export const router = createRouter();

router.post('/shows/*', idempotencyKey);

/**
 * allow regular users
 */
router.use(routeGuard(['admin', 'member']));

router
  .openapi(routes.list, handlers.list)
  .openapi(routes.getOne, handlers.getOne);
// .openapi(routes.getMaterials, handlers.getMaterials);

export default router;
