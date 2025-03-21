import { createRouter } from "@/lib/create-app";
import * as routes from "./materials.routes";
import * as handlers from "./materials.handlers";

export const router = createRouter();

/**
 * allow only admin and manager users
 */
router.use(async (_c, next) => {
  // TODO: authenticate/authorize request
  await next();
});

router.openapi(routes.list, handlers.list);

export default router;
