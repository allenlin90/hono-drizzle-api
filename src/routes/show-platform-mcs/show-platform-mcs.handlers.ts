import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  // GetOneRoute,
  ListRoute,
  // PatchRoute,
  // RemoveRoute,
} from "./show-platform-mcs.routes";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  isNotNull,
  isNull,
} from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import {
  mc,
  showPlatformMc,
  showPlatform,
  show,
  platform,
  brand,
  studioRoom,
} from "@/db/schema";
import { showPlatformMcSerializer } from "@/serializers/show-platform-mc.serializer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, mc_name, start_time, end_time } = c.req.valid("query");

  const iLikeByMcName = mc_name ? ilike(mc.name, `%${mc_name}%`) : undefined;
  const startTime = start_time ? gte(show.start_time, start_time) : undefined;
  const endTime = end_time ? gte(show.end_time, end_time) : undefined;
  const activeShowPlatformMcs = isNull(showPlatformMc.deleted_at);
  const activeShowPlatforms = isNull(showPlatform.deleted_at);
  const activeMcs = isNull(mc.deleted_at);
  const activeBrands = isNull(brand.deleted_at);
  const activeShows = isNull(show.deleted_at);
  const activePlatforms = isNull(platform.deleted_at);
  const activeStudioRooms = isNull(studioRoom.deleted_at);
  const filters = and(
    iLikeByMcName,
    startTime,
    endTime,
    activeShowPlatformMcs,
    activeShowPlatforms,
    activeMcs,
    activeBrands,
    activeShows,
    activePlatforms,
    activeStudioRooms
  );

  const showPlatformMcs = await db
    .select({
      ...getTableColumns(showPlatformMc),
      brand: {
        ...getTableColumns(brand),
      },
      mc: {
        ...getTableColumns(mc),
      },
      platform: {
        ...getTableColumns(platform),
      },
      show_platform: {
        ...getTableColumns(showPlatform),
      },
      show: {
        ...getTableColumns(show),
      },
      studio_room: {
        ...getTableColumns(studioRoom),
      },
    })
    .from(showPlatformMc)
    .innerJoin(
      showPlatform,
      and(eq(showPlatformMc.show_platform_id, showPlatform.id))
    )
    .innerJoin(mc, and(eq(showPlatformMc.mc_id, mc.id)))
    .innerJoin(show, and(eq(showPlatform.show_id, show.id)))
    .innerJoin(brand, and(eq(show.brand_id, brand.id)))
    .innerJoin(platform, and(eq(showPlatform.platform_id, platform.id)))
    .leftJoin(studioRoom, and(eq(showPlatform.studio_room_id, studioRoom.id)))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(show.start_time));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(showPlatformMc)
    .innerJoin(
      showPlatform,
      and(eq(showPlatformMc.show_platform_id, showPlatform.id))
    )
    .innerJoin(mc, and(eq(showPlatformMc.mc_id, mc.id)))
    .innerJoin(show, and(eq(showPlatform.show_id, show.id)))
    .innerJoin(brand, and(eq(show.brand_id, brand.id)))
    .innerJoin(platform, and(eq(showPlatform.platform_id, platform.id)))
    .leftJoin(studioRoom, and(eq(showPlatform.studio_room_id, studioRoom.id)))
    .where(filters);

  const data = showPlatformMcs.map(showPlatformMcSerializer);

  return c.json(
    {
      object: "show-platform-mc",
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

  const showPlatform = payload.show_platform!;
  const mc = payload.mc!;

  const [insertedShowPlatformMc] = await db
    .insert(showPlatformMc)
    .values({
      show_platform_id: showPlatform.id,
      mc_id: mc.id,
    })
    .onConflictDoUpdate({
      target: [showPlatformMc.show_platform_id, showPlatformMc.mc_id],
      set: {
        show_platform_id: showPlatform.id,
        mc_id: mc.id,
        deleted_at: null,
      },
      setWhere: isNotNull(showPlatformMc.deleted_at),
    })
    .returning();

  if (!insertedShowPlatformMc) {
    return c.json(
      {
        message: "The MC has been assigned to the show-platform",
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return c.json(showPlatformMcSerializer({}), HttpStatusCodes.CREATED);
};
