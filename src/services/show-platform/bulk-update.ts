import type { PatchBulkShowPlatformSchema } from "@/db/schema/show-platform.schema";
import type { createUpdateSchema } from "drizzle-zod";
import {
  and,
  eq,
  getTableColumns,
  inArray,
  isNull,
  sql,
  SQL,
} from "drizzle-orm";
import { z } from "@hono/zod-openapi";

import db from "@/db";
import { brand, platform, show, studioRoom } from "@/db/schema";
import { showPlatform } from "@/db/schema/show-platform.schema";

type uidKeys = "showPlatformIds" | "platformIds" | "showIds" | "studioRoomIds";

type Error = { message: string; payload: PatchBulkShowPlatformSchema };

type ShowPlatformToUpdate = z.infer<
  ReturnType<typeof createUpdateSchema<typeof showPlatform>>
>;

type BulkUpdateShowPlatform = {
  showPlatforms: PatchBulkShowPlatformSchema[];
};

export const bulkUpdateShowPlatform = async ({
  showPlatforms,
}: BulkUpdateShowPlatform) => {
  const { dataToUpdate, errors, resolvedIds } =
    await validateUpdateShowPlatformPayload({ showPlatforms });

  if (dataToUpdate.length === 0) {
    return {
      errors,
      updatedShowPlatforms: [],
      resolvedIds,
    };
  }

  const showPlatformUids = dataToUpdate.map((sp) => sp.uid!);
  const updatedAt = new Date().toISOString();
  const {
    showIdQuery,
    platformIdQuery,
    studioRoomIdQuery,
    isActiveQuery,
    aliasIdQuery,
  } = generateUpdateQuery(dataToUpdate);

  const updatedShowPlatforms = await db.transaction(async (tx) => {
    return tx
      .update(showPlatform)
      .set({
        show_id: showIdQuery,
        platform_id: platformIdQuery,
        studio_room_id: studioRoomIdQuery,
        is_active: isActiveQuery,
        alias_id: aliasIdQuery,
        updated_at: updatedAt,
      })
      .where(
        and(
          inArray(showPlatform.uid, showPlatformUids),
          isNull(showPlatform.deleted_at)
        )
      )
      .returning();
  });

  return {
    errors,
    resolvedIds,
    updatedShowPlatforms,
  };
};

function generateUpdateQuery(dataToUpdate: ShowPlatformToUpdate[]) {
  const showIdChunks: SQL[] = [sql`(case`];
  const platformIdChunks: SQL[] = [sql`(case`];
  const studioRoomIdChunks: SQL[] = [sql`(case`];
  const isActiveChunks: SQL[] = [sql`(case`];
  const aliasIdChunks: SQL[] = [sql`(case`];

  dataToUpdate.forEach((payload) => {
    if (payload.show_id) {
      showIdChunks.push(
        sql`when ${showPlatform.uid} = ${payload.uid} then ${payload.show_id}`
      );
    }

    if (payload.platform_id) {
      platformIdChunks.push(
        sql`when ${showPlatform.uid} = ${payload.uid} then ${payload.platform_id}`
      );
    }

    if (payload.studio_room_id) {
      studioRoomIdChunks.push(
        sql`when ${showPlatform.uid} = ${payload.uid} then ${payload.studio_room_id}`
      );
    }

    if (payload.is_active !== undefined) {
      isActiveChunks.push(
        sql`when ${showPlatform.uid} = ${payload.uid} then ${payload.is_active}`
      );
    }

    if (payload.alias_id) {
      aliasIdChunks.push(
        sql`when ${showPlatform.uid} = ${payload.uid} then ${payload.alias_id}`
      );
    }
  });

  showIdChunks.push(sql`else ${showPlatform.show_id} end)`);
  platformIdChunks.push(sql`else ${showPlatform.platform_id} end)`);
  studioRoomIdChunks.push(sql`else ${showPlatform.studio_room_id} end)`);
  isActiveChunks.push(sql`else ${showPlatform.is_active} end)`);
  aliasIdChunks.push(sql`else ${showPlatform.alias_id} end)`);

  return {
    showIdQuery:
      showIdChunks.length > 2
        ? sql.join(showIdChunks, sql.raw(" "))
        : undefined,
    platformIdQuery:
      platformIdChunks.length > 2
        ? sql.join(platformIdChunks, sql.raw(" "))
        : undefined,
    studioRoomIdQuery:
      studioRoomIdChunks.length > 2
        ? sql.join(studioRoomIdChunks, sql.raw(" "))
        : undefined,
    isActiveQuery:
      isActiveChunks.length > 2
        ? sql.join(isActiveChunks, sql.raw(" "))
        : undefined,
    aliasIdQuery:
      aliasIdChunks.length > 2
        ? sql.join(aliasIdChunks, sql.raw(" "))
        : undefined,
  };
}

async function validateUpdateShowPlatformPayload({
  showPlatforms,
}: BulkUpdateShowPlatform) {
  const ids = getUniqueIds(showPlatforms);
  const resolvedIds = await resolveUIDs(ids);

  await validateOverallDuration({ ids, resolvedIds });

  const { showMap, platformMap, studioRoomMap, showPlatformMap } = resolvedIds;
  const errors: Error[] = [];
  const dataToUpdate: ShowPlatformToUpdate[] = [];

  showPlatforms.forEach((sp) => {
    const {
      show_uid,
      platform_uid,
      studio_room_uid,
      show_platform_uid,
      ...restPayload
    } = sp;
    const errorMessage: string[] = [];

    if (show_uid && !showMap.has(show_uid)) {
      errorMessage.push(`Show with uid ${show_uid} not found`);
    }
    if (platform_uid && !platformMap.has(platform_uid)) {
      errorMessage.push(`Platform with uid ${platform_uid} not found`);
    }
    if (studio_room_uid && !studioRoomMap.has(studio_room_uid)) {
      errorMessage.push(`Studio room with uid ${studio_room_uid} not found`);
    }
    if (show_platform_uid && !showPlatformMap.has(show_platform_uid)) {
      errorMessage.push(
        `Show-platform with uid ${show_platform_uid} not found`
      );
    }

    if (errorMessage.length > 0) {
      errors.push({
        message: errorMessage.join(", "),
        payload: sp,
      });
      return;
    }

    const showPlatformToUpdate: ShowPlatformToUpdate = {
      ...restPayload,
      ...(show_uid && { show_id: showMap.get(show_uid)?.id }),
      ...(platform_uid && {
        platform_id: platformMap.get(platform_uid)?.id,
      }),
      ...(studio_room_uid && {
        studio_room_id: studioRoomMap.get(studio_room_uid)?.id,
      }),
      uid: show_platform_uid,
      updated_at: new Date().toISOString(),
    };

    dataToUpdate.push(showPlatformToUpdate);
  });

  return {
    errors,
    resolvedIds,
    dataToUpdate,
  };
}

/**
 * TODO: validates the overall duration of the show-platforms
 * to prevent duplicate/redundant show-platforms
 *
 * if duration of shows of a brand assigning to a platform over the limit
 */
async function validateOverallDuration({
  ids,
  resolvedIds,
}: {
  ids: ReturnType<typeof getUniqueIds>;
  resolvedIds: Awaited<ReturnType<typeof resolveUIDs>>;
}) {}

async function resolveUIDs({
  showIds,
  platformIds,
  studioRoomIds,
  showPlatformIds,
}: ReturnType<typeof getUniqueIds>) {
  const platformsByUID = db
    .select({
      ...getTableColumns(platform),
    })
    .from(platform)
    .where(
      and(inArray(platform.uid, platformIds), isNull(platform.deleted_at))
    );

  const showsByUID = db
    .select({
      ...getTableColumns(show),
      brand: {
        ...getTableColumns(brand),
      },
    })
    .from(show)
    .innerJoin(
      brand,
      and(eq(show.brand_id, brand.id), isNull(brand.deleted_at))
    )
    .where(and(inArray(show.uid, showIds), isNull(show.deleted_at)));

  const studioRoomsByUID = db
    .select({
      ...getTableColumns(studioRoom),
    })
    .from(studioRoom)
    .where(
      and(inArray(studioRoom.uid, studioRoomIds), isNull(studioRoom.deleted_at))
    );

  const showPlatformsByUID = db
    .select({
      ...getTableColumns(showPlatform),
    })
    .from(showPlatform)
    .where(
      and(
        inArray(showPlatform.uid, showPlatformIds),
        isNull(showPlatform.deleted_at)
      )
    );

  const [
    resolvedPlatforms,
    resolvedStudioRooms,
    resolvedShows,
    resolvedShowPlatforms,
  ] = await Promise.all([
    platformsByUID,
    studioRoomsByUID,
    showsByUID,
    showPlatformsByUID,
  ]);

  const showMap = new Map(resolvedShows.map((s) => [s.uid, s]));
  const platformMap = new Map(resolvedPlatforms.map((p) => [p.uid, p]));
  const studioRoomMap = new Map(resolvedStudioRooms.map((sr) => [sr.uid, sr]));
  const showPlatformMap = new Map(
    resolvedShowPlatforms.map((sp) => [sp.uid, sp])
  );

  return {
    showMap,
    platformMap,
    studioRoomMap,
    showPlatformMap,
  };
}

function getUniqueIds(
  showPlatforms: PatchBulkShowPlatformSchema[]
): Record<uidKeys, string[]> {
  const showPlatformIds = showPlatforms.map((sp) => sp.show_platform_uid);
  const showIds = new Set<string>();
  const platformIds = new Set<string>();
  const studioRoomIds = new Set<string>();

  for (const sp of showPlatforms) {
    if (sp.show_uid) {
      showIds.add(sp.show_uid);
    }
    if (sp.platform_uid) {
      platformIds.add(sp.platform_uid);
    }
    if (sp.studio_room_uid) {
      studioRoomIds.add(sp.studio_room_uid);
    }
  }

  return {
    showIds: Array.from(showIds),
    platformIds: Array.from(platformIds),
    studioRoomIds: Array.from(studioRoomIds),
    showPlatformIds: Array.from([...new Set(showPlatformIds)]),
  };
}
