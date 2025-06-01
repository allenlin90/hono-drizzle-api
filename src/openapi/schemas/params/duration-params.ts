import { z } from "@hono/zod-openapi";

export const DurationParams = (objectType = "object") =>
  z.object({
    start_time: z.optional(z.string().datetime()).openapi({
      param: {
        name: "start_time",
        in: "query",
        required: false,
      },
      description: `${objectType} that start at or after this time`,
      example: "2021-11-11T00:00:00Z",
    }),
    end_time: z.optional(z.string().datetime()).openapi({
      param: {
        name: "end_time",
        in: "query",
        required: false,
      },
      description: `${objectType} that end at or before this time`,
      example: "2021-11-11T00:00:00Z",
    }),
  });

export type DurationParamsSchema = z.infer<ReturnType<typeof DurationParams>>;

export default DurationParams;
