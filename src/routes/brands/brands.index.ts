import { createRouter } from "@/lib/create-app";
import * as handlers from "./brands.handlers";
import * as routes from "./brands.routes";

export const router = createRouter().openapi(routes.list, handlers.list);

export default router;
