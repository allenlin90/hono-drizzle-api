import { createRouter } from "@/lib/create-app";
import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

export const router = createRouter();

router
  .openapi(routes.verify, handlers.verify);

export default router;