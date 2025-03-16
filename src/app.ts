import { createApp } from "@/lib/create-app";
import configureOpenAPI from "@/lib/configure-open-api";
import index from "@/routes/index";
import brands from "@/routes/brands/brands.index";

const app = createApp();

configureOpenAPI(app);

const routes = [index, brands];

routes.forEach((route) => app.route("/", route));

export default app;
