import { z } from "@hono/zod-openapi";
import { PREFIX } from "@/constants";

interface IdQueryParamsArgs {
  paramName: string;
  prefix: PREFIX;
}

export const IdQueryParams = ({ paramName, prefix }: IdQueryParamsArgs) =>
  z.object({
    brand_id: z.optional(z.string().startsWith(prefix)).openapi({
      param: {
        name: paramName,
        in: "query",
        required: false,
      },
      example: `${prefix}_1234`,
    }),
  });

export type IdQueryParamsSchema = z.infer<ReturnType<typeof IdQueryParams>>;

export default IdQueryParams;
