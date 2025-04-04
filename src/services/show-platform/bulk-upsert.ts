import { type bulkUpsertShowPlatformPayloadSchema } from "@/openapi/schemas/show-platforms/show-platform-bulk-upsert-payload";
import { type EntityTypes } from "@/openapi/schemas/helpers/uid-validators";

import { z } from "@hono/zod-openapi";
import { union } from "drizzle-orm/pg-core";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";

import db from "@/db";
import { platform, show, showPlatform, studioRoom } from "@/db/schema";

type uidKeys = "platformIds" | "showIds" | "showPlatformIds" | "studioRoomIds";

type ShowPlatforms = z.infer<
  typeof bulkUpsertShowPlatformPayloadSchema
>["show_platforms"];

type BulkUpsertShowPlatformArgs = {
  showPlatforms: ShowPlatforms;
};

export const bulkUpsertShowPlatform = async ({
  showPlatforms,
}: BulkUpsertShowPlatformArgs) => {
  const UIDs = getUniqueIds(showPlatforms);

  const { platformMap, showMap, showPlatformMap, studioRoomMap } =
    await resolveUIDs(UIDs);

  // TODO: construct bulk insert response

  // TODO: check uids cannot be resolved

  // TODO: bulk create show-platforms

  // TODO: bulk update show-platforms

  // TODO: return upsert status
};

/**
 * TODO: validates the overall duration of the show-platforms
 * to prevent duplicate/redundant show-platforms
 *
 * if duration of shows of a brand assigning to a platform over the limit
 */
function validateOverallDuration() {}

async function resolveUIDs({
  showIds,
  platformIds,
  showPlatformIds,
  studioRoomIds,
}: ReturnType<typeof getUniqueIds>) {
  const showPlatforms = db
    .select({
      object: sql<EntityTypes>`${"show_platform"}`,
      show_id: showPlatform.show_id,
      platform_id: showPlatform.platform_id,
      uid: showPlatform.uid,
      start_time: show.start_time,
      end_time: show.end_time,
      duration: sql<number>`EXTRACT(EPOCH FROM (${show.end_time} - ${show.start_time}))`, // duration in seconds
    })
    .from(showPlatform)
    .innerJoin(
      show,
      and(eq(show.id, showPlatform.show_id), isNull(show.deleted_at))
    )
    .where(
      and(
        inArray(showPlatform.uid, showPlatformIds),
        isNull(showPlatform.deleted_at)
      )
    );

  const platformsByUID = db
    .select({
      object: sql<EntityTypes>`${"platform"}`,
      id: platform.id,
      uid: platform.uid,
    })
    .from(platform)
    .where(
      and(inArray(platform.uid, platformIds), isNull(platform.deleted_at))
    );

  const showsByUID = db
    .select({
      object: sql<EntityTypes>`${"show"}`,
      id: show.id,
      uid: show.uid,
      start_time: show.start_time,
      end_time: show.end_time,
      duration: sql<number>`EXTRACT(EPOCH FROM (${show.end_time} - ${show.start_time}))`, // duration in seconds
    })
    .from(show)
    .where(and(inArray(show.uid, showIds), isNull(show.deleted_at)));

  const studioRoomsByUID = db
    .select({
      object: sql<EntityTypes>`${"studio_room"}`,
      id: studioRoom.id,
      uid: studioRoom.uid,
    })
    .from(studioRoom)
    .where(
      and(inArray(studioRoom.uid, studioRoomIds), isNull(studioRoom.deleted_at))
    );

  const [
    resolvedShowsPlatformsStudioRooms,
    resolvedShows,
    resolvedShowPlatforms,
  ] = await Promise.all([
    union(platformsByUID, studioRoomsByUID),
    showsByUID,
    showPlatforms,
  ]);

  const showPlatformMap = new Map(
    resolvedShowPlatforms.map((sp) => [sp.uid, sp])
  );
  const showMap = new Map(resolvedShows.map((s) => [s.uid, s]));
  const platformMap = new Map<
    string,
    { object: EntityTypes; id: number; uid: string }
  >();
  const studioRoomMap = new Map<
    string,
    { object: EntityTypes; id: number; uid: string }
  >();

  resolvedShowsPlatformsStudioRooms.forEach((sp) => {
    if (sp.object === "platform") {
      platformMap.set(sp.uid, sp);
    }
    if (sp.object === "studio_room") {
      studioRoomMap.set(sp.uid, sp);
    }
  });

  return {
    showPlatformMap,
    showMap,
    platformMap,
    studioRoomMap,
  };
}

function getUniqueIds(showPlatforms: ShowPlatforms): Record<uidKeys, string[]> {
  const showPlatformIds = new Set<string>();
  const showIds = new Set<string>();
  const platformIds = new Set<string>();
  const studioRoomIds = new Set<string>();

  for (const sp of showPlatforms) {
    if ("show_platform_uid" in sp && sp["show_platform_uid"]) {
      showPlatformIds.add(sp["show_platform_uid"]);
    }
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
    showPlatformIds: Array.from(showPlatformIds),
    showIds: Array.from(showIds),
    platformIds: Array.from(platformIds),
    studioRoomIds: Array.from(studioRoomIds),
  };
}
