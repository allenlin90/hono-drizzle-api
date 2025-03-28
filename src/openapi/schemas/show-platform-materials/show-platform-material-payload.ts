import {
  insertShowPlatformMaterialSchema,
  patchShowPlatformMaterialSchema,
  type PatchShowPlatformMaterialSchema,
} from "@/db/schema/show-platform-material.schema";
import { uidValidator } from "../helpers/uid-validators";

export const createShowPlatformMaterialPayloadSchema =
  insertShowPlatformMaterialSchema.transform<ShowPlatformMaterialPayload>(
    uidValidator
  );

export const patchShowPlatformMaterialPayloadSchema =
  patchShowPlatformMaterialSchema.transform<ShowPlatformMaterialPayload>(
    uidValidator
  );

export interface ShowPlatformMaterialPayload {
  params: PatchShowPlatformMaterialSchema;
  material?: { id?: number; uid: string };
  show?: { id?: number; uid: string };
  platform?: { id?: number; uid: string };
}
