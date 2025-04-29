import { createApp } from "@/lib/create-app";
import configureOpenAPI from "@/lib/configure-open-api";
import adminRoutes from "@/routes/admin";
import apiRoutes from "@/routes/api";

const app = createApp();

configureOpenAPI(app);

apiRoutes.forEach((route) => app.route("/", route));
adminRoutes.forEach((route) => app.route("/admin", route));

export default app;
