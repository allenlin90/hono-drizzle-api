import { createRouter } from "@/lib/create-app";
import idempotencyKey from "@/validators/idempotency-key";
import * as routes from "./materials.routes";
import * as handlers from "./materials.handlers";

export const router = createRouter();

router.post("/materials/*", idempotencyKey);

/**
 * allow only admin and manager users
 */
router.use(async (_c, next) => {
  // TODO: authenticate/authorize request
  await next();
});

router
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);

export default router;
