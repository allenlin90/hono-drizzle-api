import { z } from "@hono/zod-openapi";
import { PREFIX } from "@/constants";

// TODO: find a better way to handle id to query string in generic
export const CityIdQueryParams = () =>
  z.object({
    city_id: z.optional(z.string().startsWith(PREFIX.CITY)).openapi({
      param: {
        name: "city_id",
        in: "query",
        required: false,
      },
      example: `${PREFIX.CITY}_1234`,
    }),
  });

export type CityIdQueryParamsSchema = z.infer<
  ReturnType<typeof CityIdQueryParams>
>;

export default CityIdQueryParams;
