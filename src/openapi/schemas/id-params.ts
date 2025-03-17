import type { PREFIX } from "@/constants";
import { z } from "@hono/zod-openapi";

export const IdParams = (prefix: PREFIX) =>
  z.object({
    id: z
      .string()
      .startsWith(prefix)
      .openapi({
        param: {
          name: "id",
          in: "path",
          required: true,
        },
        required: ["id"],
        example: `${prefix}_1234`,
      }),
  });

export default IdParams;
