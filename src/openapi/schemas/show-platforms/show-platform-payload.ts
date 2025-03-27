import { z } from "@hono/zod-openapi";

import {
  insertShowPlatformSchema,
  patchShowPlatformSchema,
  type PatchShowPlatformSchema,
} from "@/db/schema/show-platform.schema";
import { uidValidator } from "../helpers/uid-validators";

export interface ShowPlatformPayload {
  params: Omit<PatchShowPlatformSchema, "is_active">;
  platform?: { id: number; uid: string };
  show?: { id: number; uid: string };
  studio_room?: { id: number; uid: string };
  is_active: boolean | undefined;
}

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

export const updateShowPlatformPayloadSchema =
  patchShowPlatformSchema.transform<ShowPlatformPayload>(
    showPlatformPayloadHandler
  );
