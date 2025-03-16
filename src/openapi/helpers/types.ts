import type { z } from "@hono/zod-openapi";

export type ZodSchema =
  // @ts-expect-error
  z.ZodUnion | z.AnyZodObject | z.ZodArray<z.AnyZodObject>;
