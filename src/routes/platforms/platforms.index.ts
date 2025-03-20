import { createRouter } from "@/lib/create-app";
import * as handlers from "./platforms.handlers";
import * as routes from "./platforms.routes";

export const router = createRouter();

router.use(async (_c, next) => {
  // TODO: authenticate/authorize request
  await next();
});

router
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch);

export default router;
