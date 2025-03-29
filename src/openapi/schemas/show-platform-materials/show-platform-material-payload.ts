import { z } from "@hono/zod-openapi";
import {
  insertShowPlatformMaterialSchema,
  patchShowPlatformMaterialSchema,
  type PatchShowPlatformMaterialSchema,
} from "@/db/schema/show-platform-material.schema";
import { PREFIX } from "@/constants";
import { uidValidator } from "../helpers/uid-validators";
import { showPlatformValidator } from "../helpers/show-platform-validator";

export const createShowPlatformMaterialPayloadSchema = z.union([
  insertShowPlatformMaterialSchema.transform<ShowPlatformMaterialPayload>(
    uidValidator
  ),
  showPlatformValidator(
    z.object({ material_uid: z.string().startsWith(PREFIX.MATERIAL) })
  ),
]);

export const patchShowPlatformMaterialPayloadSchema = z.union([
  patchShowPlatformMaterialSchema.transform<ShowPlatformMaterialPayload>(
    uidValidator
  ),
  showPlatformValidator(
    z.object({ material_uid: z.string().startsWith(PREFIX.MATERIAL) })
  ),
]);

export interface ShowPlatformMaterialPayload {
  params: PatchShowPlatformMaterialSchema;
  material?: { id?: number; uid: string };
  show?: { id?: number; uid: string };
  platform?: { id?: number; uid: string };
}
