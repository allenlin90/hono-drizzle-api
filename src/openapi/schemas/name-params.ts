import { z } from "@hono/zod-openapi";

export const NameParams = (nameExamples = ["object"]) =>
  z.object({
    name: z
      .string()
      .min(1)
      .optional()
      .openapi({
        param: {
          name: "name",
          in: "query",
          required: false,
        },
        description: "The name of the object",
        examples: nameExamples,
      }),
  });

export default NameParams;
