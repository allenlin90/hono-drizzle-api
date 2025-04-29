import type { AppRouteHandler } from "@/lib/types";
import type { GetOneRoute, ListRoute } from "./shows.routes";
import { and, count, desc, eq, getTableColumns, ilike, isNull, or } from "drizzle-orm";

import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import { brand, mc, platform, show, showPlatform, showPlatformMc, studio, studioRoom, user } from "@/db/schema";
import { showSerializer } from "@/serializers/api/shows/show.serializer";

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
  const userId = c.get('jwtPayload')!.id;

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
  const activeStudioRooms = isNull(studioRoom.deleted_at);
  const filters = and(
    activeBrands,
    activePlatforms,
    activeShowPlatforms,
    activeShows,
    activeStudioRooms,
    ilikeByPlatformUid,
    ilikeByShowUid,
    ilikeByStudioRoomUid,
    isApproved,
    ilikeByBrandName,
    ilikeByPlatformName,
    ilikeByShowName,
    ilikeByStudioRoomName,
    or(eq(user.clerk_uid, userId), eq(user.uid, userId))
  );

  const showPlatforms = await db
    .select({
      ...getTableColumns(showPlatformMc),
      brand: { ...getTableColumns(brand) },
      platform: { ...getTableColumns(platform) },
      showPlatform: { ...getTableColumns(showPlatform) },
      show: { ...getTableColumns(show) },
      studio_room: { ...getTableColumns(studioRoom) },
    })
    .from(showPlatformMc)
    .innerJoin(
      showPlatform,
      and(
        eq(showPlatformMc.show_id, showPlatform.show_id),
        eq(showPlatformMc.platform_id, showPlatform.platform_id),
      )
    )
    .innerJoin(show, and(eq(showPlatform.show_id, show.id)))
    .innerJoin(brand, and(eq(show.brand_id, brand.id)))
    .innerJoin(mc, and(eq(showPlatformMc.mc_id, mc.id)))
    .innerJoin(user, and(eq(mc.user_id, user.id)))
    .innerJoin(platform, and(eq(showPlatform.platform_id, platform.id)))
    .leftJoin(studioRoom, and(eq(showPlatform.studio_room_id, studioRoom.id)))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(showPlatform.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(showPlatformMc)
    .innerJoin(
      showPlatform,
      and(
        eq(showPlatformMc.show_id, showPlatform.show_id),
        eq(showPlatformMc.platform_id, showPlatform.platform_id),
      )
    )
    .innerJoin(show, and(eq(showPlatform.show_id, show.id)))
    .innerJoin(brand, and(eq(show.brand_id, brand.id)))
    .innerJoin(mc, and(eq(showPlatformMc.mc_id, mc.id)))
    .innerJoin(user, and(eq(mc.user_id, user.id)))
    .innerJoin(platform, and(eq(showPlatform.platform_id, platform.id)))
    .leftJoin(studioRoom, and(eq(showPlatform.studio_room_id, studioRoom.id)))
    .where(filters);

  const data = showPlatforms.map(showSerializer);

  return c.json({
    object: "show",
    data,
    limit,
    offset,
    total,
  },
    HttpStatusCodes.OK
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id: show_uid } = c.req.valid("param");
  const userId = c.get('jwtPayload')!.id;
};