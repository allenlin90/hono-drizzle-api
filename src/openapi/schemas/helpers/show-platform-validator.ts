import { z } from "@hono/zod-openapi";
import { PREFIX } from "@/constants";
import { idValidators, uidValidator } from "./uid-validators";

export const showPlatformValidator = (schema: z.AnyZodObject) => {
  return z
    .object({
      show_platform_uid: z.string().startsWith(PREFIX.SHOW_PLATFORM),
    })
    .merge(schema)
    .transform(async ({ show_platform_uid, ...values }, ctx) => {
      const { queryObject } = idValidators["show_platform"];
      const [showPlatform] = await queryObject(show_platform_uid);
      const validationResults = await uidValidator(values, ctx);

      if (!showPlatform) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Show-platform not found",
        });

        return z.NEVER;
      }

      const { show_id, show_uid, platform_id, platform_uid } = showPlatform;

      return {
        ...validationResults,
        show: { id: show_id, uid: show_uid },
        platform: { id: platform_id, uid: platform_uid },
      };
    });
};
