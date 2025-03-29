import type { ReturningObjectType } from "@/openapi/schemas/helpers/uid-validators";
import type { ShowPlatformMcPayload } from "@/openapi/schemas/show-platform-mcs/show-platform-mc-payload";

export const validateShowPlatformMcPatchPayload = (
  currentData: ReturningObjectType<"show_platform_mc">[0],
  payload: ShowPlatformMcPayload
) => {
  const { show, platform, mc } = payload;

  const sameShowUid = currentData.show.uid === show?.uid || !show?.uid;
  const samePlatformUid =
    currentData.platform.uid === platform?.uid || !platform?.uid;
  const sameMcUid = currentData.mc.uid === mc?.uid || !mc?.uid;

  return !(sameShowUid && samePlatformUid && sameMcUid);
};

export default validateShowPlatformMcPatchPayload;
