import { createApp } from "@/lib/create-app";
import configureOpenAPI from "@/lib/configure-open-api";
import index from "@/routes/index";
import brands from "@/routes/brands/brands.index";
import shows from "@/routes/shows/shows.index";
import platforms from "@/routes/platforms/platforms.index";

const app = createApp();

configureOpenAPI(app);

const routes = [index, brands, shows, platforms];

routes.forEach((route) => app.route("/", route));

export default app;
