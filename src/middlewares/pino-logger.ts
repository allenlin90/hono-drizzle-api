import pino from "pino";
import { pinoLogger as logger } from "hono-pino";
import pretty from "pino-pretty";
import env from "@/env";

export const pinoLogger = () => {
  const options = env.NODE_ENV === "production" ? {} : pretty();

  return logger({
    pino: pino(options),
  });
};
