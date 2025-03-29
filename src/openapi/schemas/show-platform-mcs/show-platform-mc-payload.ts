import { z } from "@hono/zod-openapi";
import {
  insertShowPlatformMcSchema,
  patchShowPlatformMcSchema,
  type PatchShowPlatformMcSchema,
} from "@/db/schema/show-platform-mc.schema";
import { PREFIX } from "@/constants";
import { uidValidator } from "../helpers/uid-validators";
import { showPlatformValidator } from "../helpers/show-platform-validator";

export const createShowPlatformMcPayloadSchema = z.union([
  insertShowPlatformMcSchema.transform<ShowPlatformMcPayload>(uidValidator),
  showPlatformValidator(z.object({ mc_uid: z.string().startsWith(PREFIX.MC) })),
]);

export const patchShowPlatformMcPayloadSchema = z.union([
  patchShowPlatformMcSchema.transform<ShowPlatformMcPayload>(uidValidator),
  showPlatformValidator(z.object({ mc_uid: z.string().startsWith(PREFIX.MC) })),
]);

export interface ShowPlatformMcPayload {
  params: PatchShowPlatformMcSchema;
  show?: { id?: number; uid: string };
  platform?: { id?: number; uid: string };
  mc?: { id?: number; uid: string };
}
