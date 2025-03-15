import { Hono } from "hono";
import notFound from "./middlewares/not-found";
import onError from "./middlewares/on-error";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.notFound(notFound);
app.onError(onError);

export default app;
