import { z } from "@hono/zod-openapi";

export const PageParams = ({ limit = 10, offset = 0 } = {}) =>
  z.object({
    limit: z
      .optional(
        z.coerce.number().openapi({
          param: {
            name: "limit",
            in: "query",
            required: false,
          },
          example: limit,
        })
      )
      .default(limit),
    offset: z
      .optional(
        z.coerce.number().openapi({
          param: {
            name: "offset",
            in: "query",
            required: false,
          },
          example: offset,
        })
      )
      .default(offset),
  });

export default PageParams;
