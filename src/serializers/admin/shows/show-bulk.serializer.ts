import type { bulkInsertShows } from "@/services/show/bulk-insert";

import { showSerializer } from "./show.serializer";

type ShowBulkSerializer = Omit<
  Awaited<ReturnType<typeof bulkInsertShows>>,
  "errors"
>;

export const showBulkSerializer = async ({
  resolvedIds,
  insertedShows,
}: ShowBulkSerializer) => {
  const clients = resolvedIds.clientMap.values();
  const clientMapById = new Map(
    clients.map((client) => [client.id, client])
  );

  const studioRooms = resolvedIds.studioRoomMap.values();
  const studioRoomMapById = new Map(
    studioRooms.map((studioRoom) => [studioRoom.id, studioRoom])
  );

  const shows = insertedShows.map((show) => ({
    ...show,
    client_uid: show.client_id ? clientMapById.get(show.client_id)!.uid : null,
    studio_room_uid: show.studio_room_id ? studioRoomMapById.get(show.studio_room_id)!.uid : null,
  }));

  return shows.map((show) => showSerializer(show));
};
