import type { AppRouteHandler } from "@/lib/types";
import type {
  BulkInsertRoute,
  BulkUpsertRoute,
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./shows.routes";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  isNull,
  lte,
} from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import { client, show, studioRoom } from "@/db/schema";
import { showSerializer } from "@/serializers/admin/shows/show.serializer";
import { bulkInsertShows } from "@/services/show/bulk-insert";
import { showBulkSerializer } from "@/serializers/admin/shows/show-bulk.serializer";
import { bulkUpsertShows } from "@/services/show/bulk-upsert";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, client_id, studio_room_id, show_id, name, start_time, end_time } =
    c.req.valid("query");

  const ilikeByName = name ? ilike(show.name, `%${name}%`) : undefined;
  const startTime = start_time ? gte(show.start_time, start_time) : undefined;
  const endTime = end_time ? lte(show.end_time, end_time) : undefined;
  const clientUid = client_id ? eq(client.uid, client_id) : undefined;
  const studioRoomUid = studio_room_id ? eq(studioRoom.uid, studio_room_id) : undefined;
  const showUid = show_id ? eq(show.uid, show_id) : undefined;
  const activeShows = isNull(show.deleted_at);
  const activeClients = isNull(client.deleted_at);
  const filters = and(
    activeShows,
    activeClients,
    ilikeByName,
    startTime,
    endTime,
    clientUid,
    studioRoomUid,
    showUid
  );

  const shows = await db
    .select({
      ...getTableColumns(show),
      client_uid: client.uid,
      studio_room_uid: studioRoom.uid,
    })
    .from(show)
    .leftJoin(client, eq(show.client_id, client.id))
    .leftJoin(studioRoom, eq(show.studio_room_id, studioRoom.id))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(show.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(show)
    .leftJoin(client, eq(show.client_id, client.id))
    .leftJoin(studioRoom, eq(show.studio_room_id, studioRoom.id))
    .where(filters);

  const data = shows.map(showSerializer);

  return c.json(
    {
      object: "show",
      data,
      limit,
      offset,
      total,
    },
    HttpStatusCodes.OK
  );
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const payload = c.req.valid("json");

  const clientUidCond = payload.client_uid ? eq(client.uid, payload.client_uid) : undefined;
  const [selectClient] = await db
    .select({ id: client.id })
    .from(client)
    .where(and(clientUidCond, isNull(client.deleted_at)))
    .limit(1);

  if (!selectClient) {
    return c.json(
      {
        message: "Client not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  let selectStudioRoom = null;
  if (payload.studio_room_uid) {
    const studioRoomUidCond = eq(studioRoom.uid, payload.studio_room_uid);
    const [studioRoomResult] = await db
      .select({ id: studioRoom.id })
      .from(studioRoom)
      .where(and(studioRoomUidCond, isNull(studioRoom.deleted_at)))
      .limit(1);
    selectStudioRoom = studioRoomResult;
    if (!selectStudioRoom) {
      return c.json(
        {
          message: "Studio Room not found",
        },
        HttpStatusCodes.NOT_FOUND
      );
    }
  }

  const [inserted] = await db
    .insert(show)
    .values({
      ...payload,
      client_id: selectClient.id,
      studio_room_id: selectStudioRoom?.id ?? null,
    })
    .returning();

  return c.json(
    showSerializer({
      ...inserted,
      client_uid: payload.client_uid ?? "",
      studio_room_uid: payload.studio_room_uid ?? "",
    }),
    HttpStatusCodes.CREATED
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const [showData] = await db
    .select({
      ...getTableColumns(show),
      client_uid: client.uid,
      studio_room_uid: studioRoom.uid,
    })
    .from(show)
    .leftJoin(client, eq(show.client_id, client.id))
    .leftJoin(studioRoom, eq(show.studio_room_id, studioRoom.id))
    .where(
      and(
        eq(show.uid, id),
        isNull(client.deleted_at),
        isNull(studioRoom.deleted_at),
        isNull(show.deleted_at)
      )
    )
    .limit(1);

  if (!showData) {
    return c.json(
      {
        message: "Show not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(showSerializer(showData), HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id: show_uid } = c.req.valid("param");
  const payload = c.req.valid("json");

  const showUidCond = eq(show.uid, show_uid);
  const [existingShow] = await db
    .select({ id: show.id })
    .from(show)
    .where(and(showUidCond, isNull(show.deleted_at)))
    .limit(1);

  if (!existingShow) {
    return c.json(
      {
        message: "Show not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  let selectClient = null;
  if (payload.client_uid) {
    const clientUidCond = eq(client.uid, payload.client_uid);
    const [clientResult] = await db
      .select({ id: client.id })
      .from(client)
      .where(and(clientUidCond, isNull(client.deleted_at)))
      .limit(1);
    selectClient = clientResult;
    if (!selectClient) {
      return c.json(
        {
          message: "Client not found",
        },
        HttpStatusCodes.NOT_FOUND
      );
    }
  }

  let selectStudioRoom = null;
  if (payload.studio_room_uid) {
    const studioRoomUidCond = eq(studioRoom.uid, payload.studio_room_uid);
    const [studioRoomResult] = await db
      .select({ id: studioRoom.id })
      .from(studioRoom)
      .where(and(studioRoomUidCond, isNull(studioRoom.deleted_at)))
      .limit(1);
    selectStudioRoom = studioRoomResult;
    if (!selectStudioRoom) {
      return c.json(
        {
          message: "Studio Room not found",
        },
        HttpStatusCodes.NOT_FOUND
      );
    }
  }

  const [updated] = await db
    .update(show)
    .set({
      ...payload,
      ...(selectClient && { client_id: selectClient.id }),
      ...(selectStudioRoom && { studio_room_id: selectStudioRoom.id }),
      updated_at: new Date().toISOString(),
    })
    .where(and(showUidCond, isNull(show.deleted_at)))
    .returning();

  if (!updated) {
    return c.json(
      {
        message: "Show not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  // Fetch client_uid and studio_room_uid for serializer
  const [joined] = await db
    .select({
      ...getTableColumns(show),
      client_uid: client.uid,
      studio_room_uid: studioRoom.uid,
    })
    .from(show)
    .leftJoin(client, eq(show.client_id, client.id))
    .leftJoin(studioRoom, eq(show.studio_room_id, studioRoom.id))
    .where(eq(show.id, updated.id))
    .limit(1);

  return c.json(showSerializer(joined), HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: show_uid } = c.req.valid("param");

  // TODO: remove associated data, e.g. show_platform
  const result = await db
    .update(show)
    .set({ deleted_at: new Date().toISOString() })
    .where(and(eq(show.uid, show_uid), isNull(show.deleted_at)))
    .returning();

  if (!result.length) {
    return c.json(
      {
        message: "Show not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const bulkInsert: AppRouteHandler<BulkInsertRoute> = async (c) => {
  const { shows } = c.req.valid("json");

  const { errors, insertedShows, resolvedIds } = await bulkInsertShows({
    shows,
  });

  const serializedShows = await showBulkSerializer({
    insertedShows,
    resolvedIds,
  });

  return c.json(
    { errors, shows: serializedShows },
    HttpStatusCodes.MULTI_STATUS
  );
};

export const bulkUpsert: AppRouteHandler<BulkUpsertRoute> = async (c) => {
  const { shows } = c.req.valid("json");

  const { errors, updatedShows, resolvedIds } = await bulkUpsertShows({
    shows,
  });

  const serializedShows = await showBulkSerializer({
    insertedShows: updatedShows,
    resolvedIds,
  });

  return c.json(
    { errors, shows: serializedShows },
    HttpStatusCodes.MULTI_STATUS
  );
};
