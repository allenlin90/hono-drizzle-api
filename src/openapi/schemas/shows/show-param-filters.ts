import { z } from "@hono/zod-openapi";
import { PREFIX } from "@/constants";
import { NameParams } from "@/openapi/schemas/name-params";

export const ShowParamFilters = z
  .object({
    brand_id: z.optional(z.string()).openapi({
      param: {
        name: "brand_id",
        in: "query",
        required: false,
      },
      example: `${PREFIX.BRAND}_1234`,
    }),
    name: z.optional(z.string()).openapi({
      param: {
        name: "name",
        in: "query",
        required: false,
      },
      description: "Name of the show",
      examples: ["double-eleven", "black-friday"],
    }),
    start_time: z.optional(z.string().datetime()).openapi({
      param: {
        name: "start_time",
        in: "query",
        required: false,
      },
      description: "Shows that start at or after this time",
      example: "2021-11-11T00:00:00Z",
    }),
    end_time: z.optional(z.string().datetime()).openapi({
      param: {
        name: "end_time",
        in: "query",
        required: false,
      },
      description: "Shows that end at or before this time",
      example: "2021-11-11T00:00:00Z",
    }),
  })
  .merge(NameParams(["double-eleven", "black-friday"]));

export type ShowParamFiltersSchema = z.infer<typeof ShowParamFilters>;

export default ShowParamFilters;
