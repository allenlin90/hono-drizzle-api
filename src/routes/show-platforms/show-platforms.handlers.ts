import type { AppRouteHandler } from "@/lib/types";
import type {
  BulkUpsertRoute,
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./show-platforms.routes";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  isNotNull,
  isNull,
} from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import {
  showPlatform,
  show,
  studioRoom,
  platform,
  studio,
  brand,
} from "@/db/schema";
import { selectShowPlatformSchema } from "@/db/schema/show-platform.schema";
import { showPlatformSerializer } from "@/serializers/show-platform.serializer";
import { bulkUpsertShowPlatform } from "@/services/show-platform/bulk-upsert";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const {
    offset,
    limit,
    platform_id,
    show_id,
    studio_room_id,
    is_active,
    brand_name,
    platform_name,
    show_name,
    studio_room_name,
  } = c.req.valid("query");

  const isApproved =
    is_active !== undefined ? eq(showPlatform.is_active, is_active) : undefined;

  const ilikeByPlatformUid = platform_id
    ? ilike(platform.uid, `%${platform_id}%`)
    : undefined;
  const ilikeByShowUid = show_id ? ilike(show.uid, `%${show_id}%`) : undefined;
  const ilikeByStudioRoomUid = studio_room_id
    ? ilike(studioRoom.uid, `%${studio_room_id}%`)
    : undefined;
  const ilikeByBrandName = brand_name
    ? ilike(brand.name, `%${brand_name}%`)
    : undefined;
  const ilikeByPlatformName = platform_name
    ? ilike(platform.name, `%${platform_name}%`)
    : undefined;
  const ilikeByShowName = show_name
    ? ilike(show.name, `%${show_name}%`)
    : undefined;
  const ilikeByStudioRoomName = studio_room_name
    ? ilike(studioRoom.name, `%${studio_room_name}%`)
    : undefined;

  const activeBrands = isNull(brand.deleted_at);
  const activePlatforms = isNull(platform.deleted_at);
  const activeShowPlatforms = isNull(showPlatform.deleted_at);
  const activeShows = isNull(show.deleted_at);
  const activeStudios = isNull(studio.deleted_at);
  const activeStudioRooms = isNull(studioRoom.deleted_at);
  const filters = and(
    activeBrands,
    activePlatforms,
    activeShowPlatforms,
    activeShows,
    activeStudios,
    activeStudioRooms,
    ilikeByPlatformUid,
    ilikeByShowUid,
    ilikeByStudioRoomUid,
    isApproved,
    ilikeByBrandName,
    ilikeByPlatformName,
    ilikeByShowName,
    ilikeByStudioRoomName
  );

  const showPlatforms = await db
    .select({
      ...getTableColumns(showPlatform),
      platform: { ...getTableColumns(platform) },
      show: { ...getTableColumns(show), brand_uid: brand.uid },
      studio_room: { ...getTableColumns(studioRoom) },
      studio: { ...getTableColumns(studio) },
    })
    .from(showPlatform)
    .innerJoin(show, and(eq(showPlatform.show_id, show.id)))
    .innerJoin(brand, and(eq(show.brand_id, brand.id)))
    .innerJoin(platform, and(eq(showPlatform.platform_id, platform.id)))
    .leftJoin(studioRoom, and(eq(showPlatform.studio_room_id, studioRoom.id)))
    .leftJoin(studio, and(eq(studioRoom.studio_id, studio.id)))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(showPlatform.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(showPlatform)
    .innerJoin(
      show,
      and(eq(showPlatform.show_id, show.id), isNull(show.deleted_at))
    )
    .innerJoin(
      brand,
      and(eq(show.brand_id, brand.id), isNull(brand.deleted_at))
    )
    .innerJoin(
      platform,
      and(
        eq(showPlatform.platform_id, platform.id),
        isNull(platform.deleted_at)
      )
    )
    .leftJoin(
      studioRoom,
      and(
        eq(showPlatform.studio_room_id, studioRoom.id),
        isNull(studioRoom.deleted_at)
      )
    )
    .leftJoin(
      studio,
      and(eq(studioRoom.studio_id, studio.id), isNull(studio.deleted_at))
    )
    .where(filters);

  const data = showPlatforms.map(showPlatformSerializer);

  return c.json(
    {
      object: "show-platform",
      data,
      limit,
      offset,
      total,
    },
    HttpStatusCodes.OK
  );
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { is_active, ...payload } = c.req.valid("json");

  const show = payload.show!;
  const platform = payload.platform!;
  const studio_room = payload.studio_room ?? null;

  const [inserted] = await db
    .insert(showPlatform)
    .values({
      show_id: show.id,
      platform_id: platform.id,
      studio_room_id: studio_room?.id,
      ...(is_active && { is_active }),
    })
    .onConflictDoUpdate({
      target: [showPlatform.show_id, showPlatform.platform_id],
      set: {
        is_active: is_active ?? false,
        show_id: show.id,
        platform_id: platform.id,
        ...(studio_room && { studio_room_id: studio_room.id }),
        deleted_at: null,
      },
      setWhere: isNotNull(showPlatform.deleted_at),
    })
    .returning();

  if (!inserted) {
    return c.json(
      { message: "The show-platform exists" },
      HttpStatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const data = {
    ...inserted,
    platform_uid: platform.uid,
    show_uid: show.uid,
    studio_room_uid: studio_room?.uid ?? null,
  };

  return c.json(selectShowPlatformSchema.parse(data), HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id: show_platform_uid } = c.req.valid("param");

  const [showPlatformData] = await db
    .select({
      ...getTableColumns(showPlatform),
      platform: { ...getTableColumns(platform) },
      show: { ...getTableColumns(show), brand_uid: brand.uid },
      studio_room: { ...getTableColumns(studioRoom) },
      studio: { ...getTableColumns(studio) },
    })
    .from(showPlatform)
    .innerJoin(
      show,
      and(eq(showPlatform.show_id, show.id), isNull(show.deleted_at))
    )
    .innerJoin(
      brand,
      and(eq(show.brand_id, brand.id), isNull(brand.deleted_at))
    )
    .innerJoin(
      platform,
      and(
        eq(showPlatform.platform_id, platform.id),
        isNull(platform.deleted_at)
      )
    )
    .leftJoin(
      studioRoom,
      and(
        eq(showPlatform.studio_room_id, studioRoom.id),
        isNull(studioRoom.deleted_at)
      )
    )
    .leftJoin(
      studio,
      and(eq(studioRoom.studio_id, studio.id), isNull(studio.deleted_at))
    )
    .where(
      and(
        eq(showPlatform.uid, show_platform_uid),
        isNull(showPlatform.deleted_at)
      )
    );

  if (!showPlatformData) {
    return c.json(
      { message: "Show-platform not found" },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(showPlatformSerializer(showPlatformData), HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const searchData = c.req.valid("param");

  const { show, studio_room, platform, params, ...payload } =
    c.req.valid("json");

  const removeStudioRoom = params.studio_room_uid === null;
  const studio_room_id = removeStudioRoom ? null : studio_room?.id;
  const show_id = show?.id;
  const platform_id = platform?.id;

  const [showPlatformData] = await db
    .update(showPlatform)
    .set({
      ...payload,
      ...(show_id && { show_id }),
      ...(platform_id && { platform_id }),
      ...((studio_room_id || removeStudioRoom) && { studio_room_id }),
    })
    .where(
      and(
        eq(showPlatform.show_id, searchData.show_id),
        eq(showPlatform.platform_id, searchData.platform_id),
        isNull(showPlatform.deleted_at)
      )
    )
    .returning();

  const platform_uid = platform?.uid ?? searchData.platform_uid;
  const show_uid = show?.uid ?? searchData.show_uid;
  const studio_room_uid = removeStudioRoom
    ? null
    : studio_room?.uid ?? searchData.studio_room_uid;

  const data = {
    ...showPlatformData,
    platform_uid,
    show_uid,
    studio_room_uid,
  };

  return c.json(selectShowPlatformSchema.parse(data), HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: show_platform_id } = c.req.valid("param");

  // TODO: remove associated data, e.g. show_platform_mc
  const [showPlatformData] = await db
    .update(showPlatform)
    .set({ deleted_at: new Date().toISOString() })
    .where(
      and(
        eq(showPlatform.uid, show_platform_id),
        isNull(showPlatform.deleted_at)
      )
    )
    .returning();

  if (!showPlatformData) {
    return c.json(
      { message: "Show-platform not found" },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const bulkUpsert: AppRouteHandler<BulkUpsertRoute> = async (c) => {
  const { show_platforms: showPlatforms } = c.req.valid("json");

  try {
    await bulkUpsertShowPlatform({ showPlatforms });
  } catch (error: any) {}

  // TODO: respond correctly
  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
