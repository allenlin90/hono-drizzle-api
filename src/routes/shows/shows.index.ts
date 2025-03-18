import { createRouter } from "@/lib/create-app";
import * as routes from "./shows.routes";
import * as handlers from "./shows.handlers";

export const router = createRouter();

router.use(async (_c, next) => {
  // TODO: authenticate/authorize request
  await next();
});

router.openapi(routes.list, handlers.list);

export default router;
