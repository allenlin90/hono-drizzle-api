import { z } from "@hono/zod-openapi";

export const EmailParams = z.object({
  email: z
    .string()
    .email()
    .optional()
    .openapi({
      param: {
        name: "email",
        in: "query",
        required: false,
      },
      description: "The email of the object",
    }),
});

export default EmailParams;
