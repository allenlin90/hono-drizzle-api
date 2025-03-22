import { z } from "@hono/zod-openapi";
import { PREFIX } from "@/constants";

// TODO: find a better way to handle id to query string in generic
export const AddressIdQueryParams = () =>
  z.object({
    address_id: z.optional(z.string().startsWith(PREFIX.ADDRESS)).openapi({
      param: {
        name: "address_id",
        in: "query",
        required: false,
      },
      example: `${PREFIX.ADDRESS}_1234`,
    }),
  });

export type AddressIdQueryParamsSchema = z.infer<
  ReturnType<typeof AddressIdQueryParams>
>;

export default AddressIdQueryParams;
