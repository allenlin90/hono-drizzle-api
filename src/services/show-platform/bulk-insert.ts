import type { createInsertSchema } from "drizzle-zod";
import { z } from "@hono/zod-openapi";
import { and, eq, getTableColumns, inArray, isNull, sql } from "drizzle-orm";

import db from "@/db";
import { brand, platform, show, studioRoom } from "@/db/schema";
import {
  showPlatform,
  type InsertShowPlatformSchema,
} from "@/db/schema/show-platform.schema";

type uidKeys = "platformIds" | "showIds" | "studioRoomIds";

type Error = { message: string; payload: InsertShowPlatformSchema };

type ShowPlatformToInsert = z.infer<
  ReturnType<typeof createInsertSchema<typeof showPlatform>>
>;

type BulkUpsertShowPlatformArgs = {
  showPlatforms: InsertShowPlatformSchema[];
};

export const bulkInsertShowPlatform = async ({
  showPlatforms,
}: BulkUpsertShowPlatformArgs) => {
  const { errors, resolvedIds, dataToInsert } =
    await validateInsertShowPlatformPayload({
      showPlatforms,
    });

  const insertedShowPlatforms = await db.transaction(async (tx) => {
    return tx
      .insert(showPlatform)
      .values(dataToInsert)
      .onConflictDoUpdate({
        target: [showPlatform.show_id, showPlatform.platform_id],
        set: {
          show_id: sql`excluded.show_id`,
          platform_id: sql`excluded.platform_id`,
          studio_room_id: sql`excluded.studio_room_id`,
          is_active: sql`excluded.is_active`,
          alias_id: sql`case when excluded.alias_id is not null then excluded.alias_id else ${showPlatform.alias_id} end`,
          updated_at: new Date().toISOString(),
        },
      })
      .returning();
  });

  return {
    errors,
    resolvedIds,
    insertedShowPlatforms,
  };
};

async function validateInsertShowPlatformPayload({
  showPlatforms,
}: BulkUpsertShowPlatformArgs) {
  const ids = getUniqueIds(showPlatforms);
  const resolvedIds = await resolveUIDs(ids);

  await validateOverallDuration({ ids, resolvedIds });

  const { platformMap, showMap, studioRoomMap } = resolvedIds;
  const errors: Error[] = [];
  const dataToInsert: ShowPlatformToInsert[] = [];

  showPlatforms.forEach((payload) => {
    const errorMessage: string[] = [];
    const { platform_uid, studio_room_uid, show_uid, ...restPayload } = payload;
    const platform = platformMap.get(platform_uid);
    const show = showMap.get(show_uid);

    if (!platform) {
      errorMessage.push(`Platform with UID ${platform_uid} not found`);
    }

    if (!show) {
      errorMessage.push(`Show with UID ${show_uid} not found`);
    }

    let studioRoom;
    if (studio_room_uid) {
      studioRoom = studioRoomMap.get(studio_room_uid);

      if (!studioRoom) {
        errorMessage.push(`Studio room with UID ${studio_room_uid} not found`);
      }
    }

    if (errorMessage.length > 0) {
      errors.push({
        message: errorMessage.join(", "),
        payload,
      });
      return;
    }

    dataToInsert.push({
      ...restPayload,
      ...(studioRoom && {
        studio_room_id: studioRoom.id,
      }),
      platform_id: platform!.id,
      show_id: show!.id,
    });
  });

  return { errors, resolvedIds, dataToInsert };
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

  const [resolvedPlatforms, resolvedStudioRooms, resolvedShows] =
    await Promise.all([platformsByUID, studioRoomsByUID, showsByUID]);

  const showMap = new Map(resolvedShows.map((s) => [s.uid, s]));
  const platformMap = new Map(resolvedPlatforms.map((p) => [p.uid, p]));
  const studioRoomMap = new Map(resolvedStudioRooms.map((sr) => [sr.uid, sr]));

  return {
    showMap,
    platformMap,
    studioRoomMap,
  };
}

function getUniqueIds(
  showPlatforms: InsertShowPlatformSchema[]
): Record<uidKeys, string[]> {
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
  };
}
