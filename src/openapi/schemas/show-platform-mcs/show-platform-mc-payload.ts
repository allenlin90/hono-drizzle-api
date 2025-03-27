import {
  insertShowPlatformMcSchema,
  type PatchShowPlatformMcSchema,
} from "@/db/schema/show-platform-mc.schema";
import { uidValidator } from "../helpers/uid-validators";

export const createShowPlatformMcPayloadSchema =
  insertShowPlatformMcSchema.transform<ShowPlatformMcPayload>(uidValidator);

export interface ShowPlatformMcPayload {
  params: PatchShowPlatformMcSchema;
  show_platform?: { id: number; uid: string };
  mc?: { id: number; uid: string };
}
