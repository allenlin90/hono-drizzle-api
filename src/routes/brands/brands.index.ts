import { createRouter } from "@/lib/create-app";
import * as handlers from "./brands.handlers";
import * as routes from "./brands.routes";

export const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch);

export default router;
