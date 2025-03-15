import { Hono } from "hono";
import { notFound } from "./middlewares/not-found";
import { onError } from "./middlewares/on-error";
import { pinoLogger } from "./middlewares/pino-logger";

const app = new Hono();

app.use(pinoLogger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.notFound(notFound);
app.onError(onError);

export default app;
