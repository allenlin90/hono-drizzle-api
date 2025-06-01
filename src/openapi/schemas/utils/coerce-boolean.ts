import { z } from "@hono/zod-openapi";

export const coerceBoolean = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    if (val === "0") return false;
    if (val === "1") return true;
    if (val.toLowerCase() === "true") return true;
    if (val.toLowerCase() === "false") return false;
    throw new Error("Invalid boolean value");
  });

export default coerceBoolean;
