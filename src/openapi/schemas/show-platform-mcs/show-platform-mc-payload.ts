import {
  insertShowPlatformMcSchema,
  patchShowPlatformMcSchema,
  type PatchShowPlatformMcSchema,
} from "@/db/schema/show-platform-mc.schema";
import { uidValidator } from "../helpers/uid-validators";

export const createShowPlatformMcPayloadSchema =
  insertShowPlatformMcSchema.transform<ShowPlatformMcPayload>(uidValidator);

export const patchShowPlatformMcPayloadSchema =
  patchShowPlatformMcSchema.transform<ShowPlatformMcPayload>(uidValidator);

export interface ShowPlatformMcPayload {
  params: PatchShowPlatformMcSchema;
  show?: { id?: number; uid: string };
  platform?: { id?: number; uid: string };
  mc?: { id?: number; uid: string };
}
