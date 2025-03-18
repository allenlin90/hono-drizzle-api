import { z } from "@hono/zod-openapi";
import type { ZodSchema } from "zod";

export const PaginatedObjectsSchema = <T extends ZodSchema>({
  objectType = "object",
  objectSchema,
}: {
  objectType?: string;
  objectSchema: T;
}) => {
  return z.object({
    object: z.literal(objectType),
    data: z.array(objectSchema),
    limit: z.number(),
    offset: z.number(),
    total: z.number(),
  });
};

export default PaginatedObjectsSchema;
