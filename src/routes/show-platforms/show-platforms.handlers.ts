import type { AppRouteHandler } from "@/lib/types";
import type { ListRoute } from "./show-platforms.routes";
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
import { showPlatform, show, studioRoom, platform } from "@/db/schema";
import { showPlatformSerializer } from "@/serializers/show-platform.serializer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, platform_id, show_id, studio_room_id, is_active } =
    c.req.valid("query");

  const isApproved =
    is_active !== undefined ? eq(showPlatform.is_active, is_active) : undefined;

  const ilikeByPlatformUid = platform_id
    ? ilike(platform.uid, `%${platform_id}%`)
    : undefined;
  const ilikeByShowUid = show_id ? ilike(show.uid, `%${show_id}%`) : undefined;
  const ilikeByStudioRoomUid = studio_room_id
    ? ilike(studioRoom.uid, `%${studio_room_id}%`)
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
    isApproved
  );

  const showPlatforms = await db
    .select({
      ...getTableColumns(showPlatform),
      platform_uid: platform.uid,
      show_uid: show.uid,
      studio_room_uid: studioRoom.uid,
    })
    .from(showPlatform)
    .innerJoin(platform, eq(showPlatform.platform_id, platform.id))
    .innerJoin(show, eq(showPlatform.show_id, show.id))
    .innerJoin(studioRoom, eq(showPlatform.studio_room_id, studioRoom.id))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(showPlatform.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(showPlatform)
    .innerJoin(platform, eq(showPlatform.platform_id, platform.id))
    .innerJoin(show, eq(showPlatform.show_id, show.id))
    .innerJoin(studioRoom, eq(showPlatform.studio_room_id, studioRoom.id))
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
