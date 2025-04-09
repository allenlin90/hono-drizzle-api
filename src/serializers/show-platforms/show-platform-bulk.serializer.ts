import type { bulkInsertShowPlatform } from "@/services/show-platform/bulk-insert";

import { selectShowPlatformSchema } from "@/db/schema/show-platform.schema";

type ShowPlatformBulkSerializer = Omit<
  Awaited<ReturnType<typeof bulkInsertShowPlatform>>,
  "errors"
>;

export const showPlatformBulkSerializer = async ({
  resolvedIds,
  insertedShowPlatforms,
}: ShowPlatformBulkSerializer) => {
  const platforms = resolvedIds.platformMap.values();
  const platformMapById = new Map(
    platforms.map((platform) => [platform.id, platform])
  );

  const shows = resolvedIds.showMap.values();
  const showMapById = new Map(shows.map((show) => [show.id, show]));

  const studioRooms = resolvedIds.studioRoomMap.values();
  const studioRoomMapById = new Map(
    studioRooms.map((studioRoom) => [studioRoom.id, studioRoom])
  );

  const showPlatforms = insertedShowPlatforms.map((showPlatform) => ({
    ...showPlatform,
    platform_uid: platformMapById.get(showPlatform.platform_id)!.uid,
    show_uid: showMapById.get(showPlatform.show_id)!.uid,
    studio_room_uid: showPlatform.studio_room_id
      ? studioRoomMapById.get(showPlatform.studio_room_id)?.uid ?? null
      : null,
  }));

  return showPlatforms.map((sp) => selectShowPlatformSchema.parse(sp));
};
