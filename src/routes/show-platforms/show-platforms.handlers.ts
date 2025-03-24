import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
} from "./show-platforms.routes";
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

  const activePlatforms = isNull(platform.deleted_at);
  const activeShows = isNull(show.deleted_at);
  const activeStudioRooms = isNull(studioRoom.deleted_at);
  const filters = and(
    activePlatforms,
    activeShows,
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
      studio_room: { ...getTableColumns(studioRoom), studio_uid: studio.uid },
    })
    .from(showPlatform)
    .innerJoin(show, eq(showPlatform.show_id, show.id))
    .innerJoin(brand, eq(show.brand_id, brand.id))
    .innerJoin(platform, eq(showPlatform.platform_id, platform.id))
    .innerJoin(studioRoom, eq(showPlatform.studio_room_id, studioRoom.id))
    .innerJoin(studio, eq(studioRoom.studio_id, studio.id))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(showPlatform.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(showPlatform)
    .innerJoin(show, eq(showPlatform.show_id, show.id))
    .innerJoin(brand, eq(show.brand_id, brand.id))
    .innerJoin(platform, eq(showPlatform.platform_id, platform.id))
    .innerJoin(studioRoom, eq(showPlatform.studio_room_id, studioRoom.id))
    .innerJoin(studio, eq(studioRoom.studio_id, studio.id))
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
  const { is_active, show, studio_room, platform } = c.req.valid("json");

  const [inserted] = await db
    .insert(showPlatform)
    .values({
      show_id: show.id,
      studio_room_id: studio_room.id,
      platform_id: platform.id,
      ...(is_active && { is_active }),
    })
    .returning();

  const data = {
    ...inserted,
    platform_uid: platform.uid,
    show_uid: show.uid,
    studio_room_uid: studio_room.uid,
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
      studio_room: { ...getTableColumns(studioRoom), studio_uid: studio.uid },
    })
    .from(showPlatform)
    .innerJoin(show, eq(showPlatform.show_id, show.id))
    .innerJoin(brand, eq(show.brand_id, brand.id))
    .innerJoin(platform, eq(showPlatform.platform_id, platform.id))
    .innerJoin(studioRoom, eq(showPlatform.studio_room_id, studioRoom.id))
    .innerJoin(studio, eq(studioRoom.studio_id, studio.id))
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
