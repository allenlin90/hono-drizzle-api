import { createRouter } from "@/lib/create-app";
import { routeGuard } from "@/middlewares/route-guard";
import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

export const router = createRouter();

router.use(routeGuard(['admin']));

router
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);

export default router;
