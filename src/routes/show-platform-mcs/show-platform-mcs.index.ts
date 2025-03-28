import { createRouter } from "@/lib/create-app";
import * as routes from "./show-platform-mcs.routes";
import * as handlers from "./show-platform-mcs.handlers";

export const router = createRouter();

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
  .openapi(routes.getOne, handlers.getOne);
// .openapi(routes.patch, handlers.patch)
// .openapi(routes.remove, handlers.remove);

export default router;
