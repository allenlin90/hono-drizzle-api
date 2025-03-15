import pino from "pino";
import { pinoLogger as logger } from "hono-pino";
import pretty from "pino-pretty";

export const pinoLogger = () => {
  return logger({
    pino: pino(pretty()),
  });
};
