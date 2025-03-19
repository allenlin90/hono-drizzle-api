import { z } from "@hono/zod-openapi";
import { PREFIX } from "@/constants";

// TODO: find a better way to handle id to query string in generic
export const BrandIdQueryParams = () =>
  z.object({
    brand_id: z.optional(z.string().startsWith(PREFIX.BRAND)).openapi({
      param: {
        name: "brand_id",
        in: "query",
        required: false,
      },
      example: `${PREFIX.BRAND}_1234`,
    }),
  });

export type BrandIdQueryParamsSchema = z.infer<
  ReturnType<typeof BrandIdQueryParams>
>;

export default BrandIdQueryParams;
