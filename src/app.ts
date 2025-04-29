import { createApp } from "@/lib/create-app";
import configureOpenAPI from "@/lib/configure-open-api";
import adminRoutes from "@/routes/admin/index";

const app = createApp();

configureOpenAPI(app);

adminRoutes.forEach((route) => app.route("/admin", route));

export default app;
