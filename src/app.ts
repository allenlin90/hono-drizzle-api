import { createApp } from "@/lib/create-app";
import configureOpenAPI from "@/lib/configure-open-api";
import index from "@/routes/index";
import brands from "@/routes/brands/brands.index";
import shows from "@/routes/shows/shows.index";

const app = createApp();

configureOpenAPI(app);

const routes = [index, brands, shows];

routes.forEach((route) => app.route("/", route));

export default app;
