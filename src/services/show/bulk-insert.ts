import type { InsertShowSchema } from "@/db/schema/show.schema";
import { and, getTableColumns, inArray, isNull } from "drizzle-orm";
import db from "@/db";
import { client, studioRoom, show } from "@/db/schema";

type ShowToInsert = Omit<InsertShowSchema, "client_uid" | "studio_room_uid"> & {
  client_id: number | null;
  studio_room_id: number | null;
};
type Error = { message: string; payload: InsertShowSchema; };
type BulkInsertShows = {
  shows: InsertShowSchema[];
};

export const bulkInsertShows = async ({ shows }: BulkInsertShows) => {
  const { errors, dataToCreate, resolvedIds } = await validateShowPayload({
    shows,
  });

  if (dataToCreate.length === 0) {
    return {
      errors,
      insertedShows: [],
      resolvedIds,
    };
  }

  // TODO: handle insertion errors
  const insertedShows = await db.transaction(async (tx) => {
    return tx.insert(show).values(dataToCreate).returning();
  });

  return {
    errors,
    insertedShows,
    resolvedIds,
  };
};

async function validateShowPayload({ shows }: BulkInsertShows) {
  const ids = getUniqueIds(shows);
  const resolvedIds = await resolveUIDs(ids);

  await validateOverallDuration({ ids, resolvedIds });

  const { clientMap, studioRoomMap } = resolvedIds;
  const errors: Error[] = [];
  const dataToCreate: ShowToInsert[] = [];

  shows.forEach((payload) => {
    const { client_uid, studio_room_uid, ...showPayload } = payload;
    const client = clientMap.get(client_uid ?? "");
    const studioRoom = studioRoomMap.get(studio_room_uid ?? "");

    if (!client && client_uid) {
      errors.push({
        message: `Client with UID ${client_uid} not found.`,
        payload,
      });
      return;
    }

    if (!studioRoom && studio_room_uid) {
      errors.push({
        message: `Studio Room with UID ${studio_room_uid} not found.`,
        payload,
      });
      return;
    }

    dataToCreate.push({
      ...showPayload,
      client_id: client?.id ?? null,
      studio_room_id: studioRoom?.id ?? null,
    });
  });

  return {
    errors,
    dataToCreate,
    resolvedIds,
  };
}

/**
 * validates the overall duration of the shows
 * to prevent duplicate/redundant shows
 *
 * if duration of shows from a brand over purchased hours
 * if duration of shows during the time over capacity (e.g. studio, studio-room capacity)
 */
async function validateOverallDuration({
  ids,
  resolvedIds,
}: {
  ids: ReturnType<typeof getUniqueIds>;
  resolvedIds: Awaited<ReturnType<typeof resolveUIDs>>;
}) { }

async function resolveUIDs({ clientIds, studioRoomIds }: ReturnType<typeof getUniqueIds>) {
  const clientsQuery = db
    .select({
      ...getTableColumns(client),
    })
    .from(client)
    .where(and(inArray(client.uid, clientIds), isNull(client.deleted_at)));

  const studioRoomsQuery = db
    .select({
      ...getTableColumns(studioRoom),
    })
    .from(studioRoom)
    .where(and(inArray(studioRoom.uid, studioRoomIds), isNull(studioRoom.deleted_at)));

  const [clients, studioRooms] = await Promise.all([
    clientsQuery,
    studioRoomsQuery,
  ]);

  const clientMap = new Map(clients.map((client) => [client.uid, client]));
  const studioRoomMap = new Map(studioRooms.map((studioRoom) => [studioRoom.uid, studioRoom]));

  return {
    clientMap,
    studioRoomMap,
  };
}

function getUniqueIds(showsPayload: InsertShowSchema[]) {
  const clientIdsSet = new Set<string>();
  const studioRoomIdsSet = new Set<string>();

  for (const payload of showsPayload) {
    if (payload.client_uid) {
      clientIdsSet.add(payload.client_uid);
    }
    if (payload.studio_room_uid) {
      studioRoomIdsSet.add(payload.studio_room_uid);
    }
  }

  return {
    clientIds: Array.from(clientIdsSet),
    studioRoomIds: Array.from(studioRoomIdsSet),
  };
}
