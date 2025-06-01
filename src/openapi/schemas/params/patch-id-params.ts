import { z } from "@hono/zod-openapi";

import {
  idValidators,
  type EntityTypes,
  type ReturningObjectType,
} from "../helpers/uid-validators";

interface PatchIdParamsArgs {
  object: EntityTypes;
}

/*
 * this is an async validator to ensure the given entity uid has an associated record
 */
export const PatchIdParams = <M extends ReturningObjectType<EntityTypes>>({
  object,
}: PatchIdParamsArgs) =>
  z
    .object({
      id: z
        .string()
        .startsWith(idValidators[object].prefix)
        .openapi({
          param: {
            name: "id",
            in: "path",
            required: true,
          },
          required: ["id"],
          example: `${idValidators[object].prefix}_1234`,
        }),
    })
    .transform(async ({ id: uid }, ctx) => {
      const { queryObject } = idValidators[object];

      const [searchData] = await queryObject(uid);

      if (!searchData) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${object} not found`,
        });

        return z.NEVER;
      }

      return searchData as M[0];
    });

export default PatchIdParams;
