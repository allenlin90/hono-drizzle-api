import { z } from "@hono/zod-openapi";

import { PREFIX } from "@/constants";
import {
  insertShowPlatformSchema,
  patchShowPlatformSchema,
  type PatchShowPlatformSchema,
} from "@/db/schema/show-platform.schema";
import { idValidators, uidValidator } from "../helpers/uid-validators";

export interface ShowPlatformPayload {
  params: Omit<PatchShowPlatformSchema, "is_active">;
  platform?: { id: number; uid: string; };
  show?: { id: number; uid: string; };
  review_form?: { id: number; uid: string; };
  reviewer?: { id: number; uid: string; };
  is_active: boolean | undefined;
}

const showPlatformValidator = (schema: z.AnyZodObject) => {
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

      const {
        show_id,
        show_uid,
        platform_id,
        platform_uid,
        reviewer_id,
        reviewer_uid,
        review_form_id,
        review_form_uid
      } = showPlatform;

      return {
        ...validationResults,
        show: { id: show_id, uid: show_uid },
        platform: { id: platform_id, uid: platform_uid },
        reviewer: { id: reviewer_id, uid: reviewer_uid },
        review_form: { id: review_form_id, uid: review_form_uid },
      };
    });
};

const showPlatformPayloadHandler = async (
  value: PatchShowPlatformSchema,
  ctx: z.RefinementCtx
) => {
  const { is_active = false, ...uids } = value;

  const res = await uidValidator<
    PatchShowPlatformSchema,
    Omit<ShowPlatformPayload, "is_active">
  >(uids, ctx);

  return { ...res, is_active };
};

export const createShowPlatformPayloadSchema =
  insertShowPlatformSchema.transform<ShowPlatformPayload>(
    showPlatformPayloadHandler
  );

export const updateShowPlatformPayloadSchema = z.union([
  patchShowPlatformSchema.transform<ShowPlatformPayload>(
    showPlatformPayloadHandler
  ),
  showPlatformValidator(
    z.object({
      reviewer_uid: z.string().startsWith(PREFIX.MEMBER).nullish(),
      review_form_uid: z.string().startsWith(PREFIX.FORM_TEMPLATE).nullish(),
    })
  ),
]);
