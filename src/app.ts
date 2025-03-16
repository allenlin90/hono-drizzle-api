import { createApp } from "@/lib/create-app";
import configureOpenAPI from "@/lib/configure-open-api";
import index from "@/routes/index";

const app = createApp();

configureOpenAPI(app);

const routes = [index];

routes.forEach((route) => app.route("/", route));

export default app;
