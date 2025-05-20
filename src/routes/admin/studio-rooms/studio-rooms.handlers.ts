import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./studio-rooms.routes";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  isNull,
} from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import { studioRoom, studio } from "@/db/schema";
import { studioRoomSerializer } from "@/serializers/admin/studio-room.serializer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, name, studio_id, room_type } = c.req.valid("query");

  const ilikeByName = name ? ilike(studioRoom.name, `%${name}%`) : undefined;
  const ilikeByStudioUid = studio_id
    ? ilike(studioRoom.uid, `%${studio_id}%`)
    : undefined;
  const isRoomType = room_type ? eq(studioRoom.type, room_type) : undefined;
  const activeStudioRooms = isNull(studioRoom.deleted_at);
  const filters = and(
    ilikeByName,
    ilikeByStudioUid,
    isRoomType,
    activeStudioRooms
  );

  const studioRooms = await db
    .select({
      ...getTableColumns(studioRoom),
      studio_uid: studio.uid,
    })
    .from(studioRoom)
    .innerJoin(
      studio,
      and(eq(studioRoom.studio_id, studio.id), isNull(studio.deleted_at))
    )
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(studioRoom.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(studioRoom)
    .innerJoin(studio, eq(studioRoom.studio_id, studio.id))
    .where(filters);

  const data = studioRooms.map(studioRoomSerializer);

  return c.json(
    {
      object: "studio-room",
      data,
      limit,
      offset,
      total,
    },
    { status: HttpStatusCodes.OK }
  );
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const payload = c.req.valid("json");

  const [selectStudio] = await db
    .select({ id: studio.id })
    .from(studio)
    .where(and(eq(studio.uid, payload.studio_uid), isNull(studio.deleted_at)))
    .limit(1);

  if (!selectStudio) {
    return c.json(
      {
        message: "Studio room not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const [inserted] = await db
    .insert(studioRoom)
    .values({
      ...payload,
      studio_id: selectStudio.id,
    })
    .returning();

  const data = studioRoomSerializer({
    ...inserted,
    studio_uid: payload.studio_uid,
  });

  return c.json(data, HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const [studioRoomData] = await db
    .select({
      ...getTableColumns(studioRoom),
      studio_uid: studio.uid,
    })
    .from(studioRoom)
    .innerJoin(studio, eq(studioRoom.studio_id, studio.id))
    .where(and(eq(studioRoom.uid, id), isNull(studioRoom.deleted_at)))
    .limit(1);

  if (!studioRoomData) {
    return c.json(
      {
        message: "Studio not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = studioRoomSerializer(studioRoomData);

  return c.json(data, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id: studio_room_id } = c.req.valid("param");
  const payload = c.req.valid("json");

  let selectStudio: { id: number; } | null = null;
  let byStudioUid = payload.studio_uid
    ? eq(studio.uid, payload.studio_uid)
    : undefined;

  if (payload.studio_uid) {
    const result = await db
      .select({ id: studio.id })
      .from(studio)
      .where(and(eq(studio.uid, payload.studio_uid), isNull(studio.deleted_at)))
      .limit(1);

    selectStudio = result[0];

    if (!selectStudio) {
      return c.json(
        {
          message: "Studio room not found",
        },
        HttpStatusCodes.NOT_FOUND
      );
    }
  }

  const [updated] = await db
    .update(studioRoom)
    .set({
      ...payload,
      ...(selectStudio && { studio_id: selectStudio?.id }),
    })
    .from(studio)
    .where(
      and(
        eq(studioRoom.uid, studio_room_id),
        byStudioUid,
        isNull(studioRoom.deleted_at)
      )
    )
    .returning({
      ...getTableColumns(studioRoom),
      studio_uid: studio.uid,
    });

  if (!updated) {
    return c.json(
      {
        message: "Studio room not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = studioRoomSerializer(updated);

  return c.json(data, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: studio_room_id } = c.req.valid("param");

  const result = await db
    .update(studioRoom)
    .set({ deleted_at: new Date().toISOString() })
    .where(and(eq(studioRoom.uid, studio_room_id), isNull(studioRoom.deleted_at)))
    .returning();

  if (!result.length) {
    return c.json(
      {
        message: "Studio room not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
