import type { AppRouteHandler } from "@/lib/types";
import type {
  BulkInsertRoute,
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
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
import { selectShowPlatformMcSchema } from "@/db/schema/show-platform-mc.schema";
import { validateShowPlatformMcPatchPayload } from "@/services/show-platform-mc/validatePatchPayload";
import { bulkInsertShowPlatformMc } from "@/services/show-platform-mc/bulk-insert";
import { showPlatformMcSerializer } from "@/serializers/show-platform-mcs/show-platform-mc.serializer";
import { showPlatformMcBulkSerializer } from "@/serializers/show-platform-mcs/show-platform-mc-bulk.serializer";

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
      and(
        eq(showPlatformMc.show_id, showPlatform.show_id),
        eq(showPlatformMc.platform_id, showPlatform.platform_id)
      )
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
      and(
        eq(showPlatformMc.show_id, showPlatform.show_id),
        eq(showPlatformMc.platform_id, showPlatform.platform_id)
      )
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

  const show = payload.show!;
  const platform = payload.platform!;
  const mc = payload.mc!;

  let insertedShowPlatformMc;
  try {
    const queryResult = await db
      .insert(showPlatformMc)
      .values({
        show_id: show.id!,
        platform_id: platform.id!,
        mc_id: mc.id!,
      })
      .onConflictDoUpdate({
        target: [
          showPlatformMc.show_id,
          showPlatformMc.platform_id,
          showPlatformMc.mc_id,
        ],
        set: {
          show_id: show.id,
          platform_id: platform.id,
          mc_id: mc.id,
          deleted_at: null,
        },
        setWhere: isNotNull(showPlatformMc.deleted_at),
      })
      .returning();

    insertedShowPlatformMc = queryResult[0];
  } catch (error: any) {
    if (error.code === "23503") {
      return c.json(
        {
          message: "show-platform does not exist",
        },
        HttpStatusCodes.UNPROCESSABLE_ENTITY
      );
    }
    throw error;
  }

  if (!insertedShowPlatformMc) {
    return c.json(
      {
        message: "The MC has been assigned to the show-platform",
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  return c.json(
    selectShowPlatformMcSchema.parse({
      ...insertedShowPlatformMc,
      show_uid: show.uid,
      platform_uid: platform.uid,
      mc_uid: mc.uid,
    }),
    HttpStatusCodes.CREATED
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id: show_platform_mc_uid } = c.req.valid("param");

  const [showPlatformMcRecord] = await db
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
      and(
        eq(showPlatformMc.show_id, showPlatform.show_id),
        eq(showPlatformMc.platform_id, showPlatform.platform_id)
      )
    )
    .innerJoin(mc, and(eq(showPlatformMc.mc_id, mc.id)))
    .innerJoin(show, and(eq(showPlatform.show_id, show.id)))
    .innerJoin(brand, and(eq(show.brand_id, brand.id)))
    .innerJoin(platform, and(eq(showPlatform.platform_id, platform.id)))
    .leftJoin(studioRoom, and(eq(showPlatform.studio_room_id, studioRoom.id)))
    .where(eq(showPlatformMc.uid, show_platform_mc_uid))
    .limit(1);

  if (!showPlatformMcRecord) {
    return c.json(
      { message: "show-platform-mc not found" },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(
    showPlatformMcSerializer(showPlatformMcRecord),
    HttpStatusCodes.OK
  );
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const searchData = c.req.valid("param");
  const jsonPayload = c.req.valid("json");
  const { show, platform, mc, params, ...payload } = jsonPayload;

  const show_id = show?.id;
  const platform_id = platform?.id;
  const mc_id = mc?.id;

  const isValidPayload = validateShowPlatformMcPatchPayload(
    searchData,
    jsonPayload
  );

  if (!isValidPayload) {
    return c.json(
      { message: "No changes detected" },
      HttpStatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  let updated;
  try {
    const queryResult = await db
      .update(showPlatformMc)
      .set({
        ...payload,
        ...(show_id && { show_id }),
        ...(platform_id && { platform_id }),
        ...(mc_id && { mc_id }),
      })
      .where(
        and(
          eq(showPlatformMc.uid, searchData.uid),
          isNull(showPlatformMc.deleted_at)
        )
      )
      .returning();

    updated = queryResult[0];
  } catch (error: any) {
    if (error.code === "23503") {
      return c.json(
        {
          message: "invalid show-platform",
        },
        HttpStatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    throw error;
  }

  const platform_uid = platform?.uid ?? searchData.platform.uid;
  const show_uid = show?.uid ?? searchData.show.uid;
  const mc_uid = mc?.uid ?? searchData.mc.uid;

  const data = {
    ...updated,
    show_uid,
    platform_uid,
    mc_uid,
  };

  return c.json(selectShowPlatformMcSchema.parse(data), HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: show_platform_mc_uid } = c.req.valid("param");

  const [removedShowPlatformMc] = await db
    .update(showPlatformMc)
    .set({ deleted_at: new Date().toISOString() })
    .where(
      and(
        eq(showPlatformMc.uid, show_platform_mc_uid),
        isNull(showPlatformMc.deleted_at)
      )
    )
    .returning();

  if (!removedShowPlatformMc) {
    return c.json(
      { message: "Show-platform-mc not found" },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const bulkInsert: AppRouteHandler<BulkInsertRoute> = async (c) => {
  const { show_platform_mcs: showPlatformMcs } = c.req.valid("json");

  const { errors, resolvedIds, insertedShowPlatformMcs } =
    await bulkInsertShowPlatformMc({ showPlatformMcs });

  const serializedShowPlatformMcs = await showPlatformMcBulkSerializer({
    insertedShowPlatformMcs,
    resolvedIds,
  });

  return c.json(
    { errors, show_platform_mcs: serializedShowPlatformMcs },
    HttpStatusCodes.MULTI_STATUS
  );
};
