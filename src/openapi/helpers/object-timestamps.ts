import { z } from "@hono/zod-openapi";

export const objectTimestamps = () => {
  return {
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    deletedAt: z.string().datetime().optional(),
  };
};

export default objectTimestamps;
