import type { ReturningObjectType } from "@/openapi/schemas/helpers/uid-validators";
import type { ShowPlatformMaterialPayload } from "@/openapi/schemas/show-platform-materials/show-platform-material-payload";

export const validateShowPlatformMaterialPatchPayload = (
  currentData: ReturningObjectType<"show_platform_material">[0],
  payload: ShowPlatformMaterialPayload
) => {
  const { show, platform, material } = payload;

  const sameShowUid = currentData.show.uid === show?.uid || !show?.uid;
  const samePlatformUid =
    currentData.platform.uid === platform?.uid || !platform?.uid;
  const sameMaterialUid =
    currentData.material.uid === material?.uid || !material?.uid;

  return !(sameShowUid && samePlatformUid && sameMaterialUid);
};

export default validateShowPlatformMaterialPatchPayload;
