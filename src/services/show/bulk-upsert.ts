import type { PatchBulkShowSchema } from "@/db/schema/show.schema";
import { and, getTableColumns, inArray, isNull, sql, SQL } from "drizzle-orm";
import db from "@/db";
import { client, show, studioRoom } from "@/db/schema";

type Show = PatchBulkShowSchema;
type ShowToUpdate = Omit<Show, "show_uid" | "client_uid" | "studio_room_uid"> & {
  id: number;
  uid: string;
  client_id: number | null;
  studio_room_id: number | null;
};
type Error = { message: string; payload: Show; };
type BulkUpsertShows = {
  shows: Show[];
};

export const bulkUpsertShows = async ({ shows }: BulkUpsertShows) => {
  const { errors, dataToUpdate, resolvedIds } = await validateUpdateShowPayload(
    { shows }
  );

  if (dataToUpdate.length === 0) {
    return {
      errors,
      updatedShows: [],
      resolvedIds,
    };
  }

  const { showIds, nameQuery, endTimeQuery, startTimeQuery } =
    generateUpdateQuery(dataToUpdate);
  const updatedAt = new Date().toISOString();

  const updatedShows = await db.transaction(async (tx) => {
    return tx
      .update(show)
      .set({
        name: nameQuery,
        start_time: startTimeQuery,
        end_time: endTimeQuery,
        updated_at: updatedAt,
      })
      .where(and(inArray(show.id, showIds), isNull(show.deleted_at)))
      .returning();
  });

  return {
    errors,
    updatedShows,
    resolvedIds,
  };
};

function generateUpdateQuery(dataToUpdate: ShowToUpdate[]) {
  const showIds: number[] = [];
  const startTimeChunks: SQL[] = [sql`(case`];
  const endTimeChunks: SQL[] = [sql`(case`];
  const nameChunks: SQL[] = [sql`(case`];

  dataToUpdate.forEach((showPayload) => {
    showIds.push(showPayload.id);

    if (showPayload.name) {
      nameChunks.push(
        sql`when ${show.id} = ${showPayload.id} then ${showPayload.name}`
      );
    }

    if (showPayload.start_time) {
      startTimeChunks.push(
        sql`when ${show.id} = ${showPayload.id} then ${showPayload.start_time}`
      );
    }

    if (showPayload.end_time) {
      endTimeChunks.push(
        sql`when ${show.id} = ${showPayload.id} then ${showPayload.end_time}`
      );
    }
  });

  nameChunks.push(sql`else ${show.name} end)`);
  startTimeChunks.push(sql`else ${show.start_time} end)`);
  endTimeChunks.push(sql`else ${show.end_time} end)`);

  return {
    nameQuery: sql.join(nameChunks, sql.raw(" ")),
    startTimeQuery: sql.join(startTimeChunks, sql.raw(" ")),
    endTimeQuery: sql.join(endTimeChunks, sql.raw(" ")),
    showIds,
  };
}

async function validateUpdateShowPayload({ shows }: BulkUpsertShows) {
  const ids = getUniqueIds(shows);
  const resolvedIds = await resolveUIDs(ids);

  await validateUpdatedShows({ ids, resolvedIds });

  const { showMap, clientMap, studioRoomMap } = resolvedIds;
  const errors: Error[] = [];
  const dataToUpdate: ShowToUpdate[] = [];

  shows.forEach((payload) => {
    const { show_uid, client_uid, studio_room_uid, ...showPayload } = payload;
    const showObj = showMap.get(show_uid);
    const clientObj = clientMap.get(client_uid ?? '');
    const studioRoomObj = studioRoomMap.get(studio_room_uid ?? '');

    if (!showObj) {
      errors.push({
        message: `Show with UID ${show_uid} not found.`,
        payload,
      });
      return;
    }

    if (client_uid && !clientObj) {
      errors.push({
        message: `Client with UID ${client_uid} not found.`,
        payload,
      });
      return;
    }

    if (studio_room_uid && !studioRoomObj) {
      errors.push({
        message: `Studio Room with UID ${studio_room_uid} not found.`,
        payload,
      });
      return;
    }

    dataToUpdate.push({
      ...showPayload,
      id: showObj.id,
      uid: showObj.uid,
      client_id: clientObj?.id ?? null,
      studio_room_id: studioRoomObj?.id ?? null,
    });
  });

  return {
    errors,
    dataToUpdate,
    resolvedIds,
  };
}

/**
 *
 * validate overall duration of updated shows
 * to prevent duplicate/redundant shows
 *
 * if duration of shows from a brand over purchased hours
 * if duration of shows during the time over capacity (e.g. studio, studio-room capacity)
 */
async function validateUpdatedShows({
  ids,
  resolvedIds,
}: {
  ids: ReturnType<typeof getUniqueIds>;
  resolvedIds: Awaited<ReturnType<typeof resolveUIDs>>;
}) { }

async function resolveUIDs({ showIds, clientIds, studioRoomIds }: ReturnType<typeof getUniqueIds>) {
  const showsQuery = await db
    .select({
      ...getTableColumns(show),
      duration: sql<number>`EXTRACT(EPOCH FROM (${show.end_time} - ${show.start_time}))`, // duration in seconds
    })
    .from(show)
    .where(and(inArray(show.uid, showIds), isNull(show.deleted_at)));

  const clientQuery = db
    .select(getTableColumns(client))
    .from(client)
    .where(and(inArray(client.uid, clientIds), isNull(client.deleted_at)));

  const studioRoomsQuery = db
    .select(getTableColumns(studioRoom))
    .from(studioRoom)
    .where(and(inArray(studioRoom.uid, studioRoomIds), isNull(studioRoom.deleted_at)));

  const [shows, clients, studioRooms] = await Promise.all([
    showsQuery,
    clientQuery,
    studioRoomsQuery,
  ]);

  const showMap = new Map<string, (typeof shows)[0]>(
    shows.map((show) => [show.uid, show])
  );

  const clientMap = new Map<string, (typeof clients)[0]>(
    clients.map((client) => [client.uid, client])
  );

  const studioRoomMap = new Map<string, (typeof studioRooms)[0]>(
    studioRooms.map((studioRoom) => [studioRoom.uid, studioRoom])
  );

  return { showMap, clientMap, studioRoomMap };
}

function getUniqueIds(shows: Show[]) {
  const clientIdsSet = new Set<string>();
  const studioRoomIdsSet = new Set<string>();
  const showIdsSet = new Set<string>();

  shows.forEach((show) => {
    if (show.client_uid) {
      clientIdsSet.add(show.client_uid);
    }
    if (show.studio_room_uid) {
      studioRoomIdsSet.add(show.studio_room_uid);
    }
    showIdsSet.add(show.show_uid);
  });

  return {
    showIds: Array.from(showIdsSet),
    clientIds: Array.from(clientIdsSet),
    studioRoomIds: Array.from(studioRoomIdsSet),
  };
}
