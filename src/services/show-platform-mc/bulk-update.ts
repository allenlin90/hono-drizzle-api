import type { PatchBulkShowPlatformMcSchema } from "@/db/schema/show-platform-mc.schema";
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
import { mc, platform, show, showPlatformMc } from "@/db/schema";

type Error = { message: string; payload: PatchBulkShowPlatformMcSchema };

type ShowPlatformMcToUpdate = z.infer<
  ReturnType<typeof createUpdateSchema<typeof showPlatformMc>>
>;

type BulkUpdateShowPlatformMc = {
  showPlatformMcs: PatchBulkShowPlatformMcSchema[];
};

export const bulkUpdateShowPlatformMc = async ({
  showPlatformMcs,
}: BulkUpdateShowPlatformMc) => {
  const { dataToUpdate, errors, resolvedIds } =
    await validateUpdateShowPlatformPayload({ showPlatformMcs });

  if (dataToUpdate.length === 0) {
    return {
      errors,
      resolvedIds,
      updatedShowPlatformMcs: [],
    };
  }

  const showPlatformMcUids = dataToUpdate.map((sp) => sp.uid!);
  const updatedAt = new Date().toISOString();
  const { mcIdQuery, platformIdQuery, showIdQuery } =
    generateUpdateQuery(dataToUpdate);

  const updatedShowPlatformMcs = await db.transaction(async (tx) => {
    return tx
      .update(showPlatformMc)
      .set({
        mc_id: mcIdQuery,
        platform_id: platformIdQuery,
        show_id: showIdQuery,
        updated_at: updatedAt,
      })
      .where(
        and(
          inArray(showPlatformMc.uid, showPlatformMcUids),
          isNull(showPlatformMc.deleted_at)
        )
      )
      .returning();
  });

  return {
    errors,
    resolvedIds,
    updatedShowPlatformMcs,
  };
};

function generateUpdateQuery(dataToUpdate: ShowPlatformMcToUpdate[]) {
  const showIdChunks: SQL[] = [sql`(case`];
  const platformIdChunks: SQL[] = [sql`(case`];
  const mcIdChunks: SQL[] = [sql`(case`];

  dataToUpdate.forEach((payload) => {
    if (payload.mc_id) {
      mcIdChunks.push(
        sql`when ${showPlatformMc.uid} = ${payload.uid} then ${payload.mc_id}`
      );
    }

    if (payload.show_id) {
      showIdChunks.push(
        sql`when ${showPlatformMc.uid} = ${payload.uid} then ${payload.show_id}`
      );
    }

    if (payload.platform_id) {
      platformIdChunks.push(
        sql`when ${showPlatformMc.uid} = ${payload.uid} then ${payload.platform_id}`
      );
    }
  });

  showIdChunks.push(sql`else ${showPlatformMc.show_id} end)`);
  platformIdChunks.push(sql`else ${showPlatformMc.platform_id} end)`);
  mcIdChunks.push(sql`else ${showPlatformMc.mc_id} end)`);

  return {
    showIdQuery:
      showIdChunks.length > 2
        ? sql.join(showIdChunks, sql.raw(" "))
        : undefined,
    platformIdQuery:
      platformIdChunks.length > 2
        ? sql.join(platformIdChunks, sql.raw(" "))
        : undefined,
    mcIdQuery:
      mcIdChunks.length > 2 ? sql.join(mcIdChunks, sql.raw(" ")) : undefined,
  };
}

async function validateUpdateShowPlatformPayload({
  showPlatformMcs,
}: BulkUpdateShowPlatformMc) {
  const ids = getUniqueIds(showPlatformMcs);
  const resolvedIds = await resolveUIDs(ids);

  await validateMcConditions({ ids, resolvedIds });

  const { mcMap, platformMap, showMap, showPlatformMcMap } = resolvedIds;
  const errors: Error[] = [];
  const dataToUpdate: ShowPlatformMcToUpdate[] = [];

  showPlatformMcs.forEach((payload) => {
    const {
      show_platform_mc_uid,
      mc_uid,
      platform_uid,
      show_uid,
      ...restPayload
    } = payload;
    const errorMessage: string[] = [];

    if (show_uid && !showMap.has(show_uid)) {
      errorMessage.push(`Show with uid ${show_uid} not found`);
    }

    if (platform_uid && !platformMap.has(platform_uid)) {
      errorMessage.push(`Platform with uid ${platform_uid} not found`);
    }

    if (mc_uid && !mcMap.has(mc_uid)) {
      errorMessage.push(`MC with uid ${mc_uid} not found`);
    }

    if (show_platform_mc_uid && !showPlatformMcMap.has(show_platform_mc_uid)) {
      errorMessage.push(
        `Show-platform-mc with uid ${show_platform_mc_uid} not found`
      );
    }

    if (errorMessage.length > 0) {
      errors.push({
        message: errorMessage.join(", "),
        payload,
      });
      return;
    }

    const showPlatformMcToUpdate: ShowPlatformMcToUpdate = {
      ...restPayload,
      ...(mc_uid && { mc_id: mcMap.get(mc_uid)?.id }),
      ...(platform_uid && { platform_id: platformMap.get(platform_uid)?.id }),
      ...(show_uid && { show_id: showMap.get(show_uid)?.id }),
      uid: show_platform_mc_uid,
      updated_at: new Date().toISOString(),
    };

    dataToUpdate.push(showPlatformMcToUpdate);
  });

  return {
    errors,
    resolvedIds,
    dataToUpdate,
  };
}

/**
 * TODO: validates if mc can be assigned with a show-platform
 */
async function validateMcConditions({
  ids,
  resolvedIds,
}: {
  ids: ReturnType<typeof getUniqueIds>;
  resolvedIds: Awaited<ReturnType<typeof resolveUIDs>>;
}) {}

async function resolveUIDs({
  mcIds,
  platformIds,
  showIds,
  showPlatformMcIds,
}: ReturnType<typeof getUniqueIds>) {
  const mcQuery = db
    .select({ ...getTableColumns(mc) })
    .from(mc)
    .where(and(inArray(mc.uid, mcIds), isNull(mc.deleted_at)));

  const platformQuery = db
    .select({ ...getTableColumns(platform) })
    .from(platform)
    .where(
      and(inArray(platform.uid, platformIds), isNull(platform.deleted_at))
    );

  const showQuery = db
    .select({
      ...getTableColumns(show),
    })
    .from(show)
    .where(and(inArray(show.uid, showIds), isNull(show.deleted_at)));

  const showPlatformMcQuery = db
    .select({ ...getTableColumns(showPlatformMc) })
    .from(showPlatformMc)
    .where(
      and(
        inArray(showPlatformMc.uid, showPlatformMcIds),
        isNull(showPlatformMc.deleted_at)
      )
    );

  const [resolvedMcs, resolvedPlatforms, resolvedShows, resolvedShowPlatforms] =
    await Promise.all([mcQuery, platformQuery, showQuery, showPlatformMcQuery]);

  const mcMap = new Map(resolvedMcs.map((mc) => [mc.uid, mc]));
  const platformMap = new Map(resolvedPlatforms.map((p) => [p.uid, p]));
  const showMap = new Map(resolvedShows.map((s) => [s.uid, s]));
  const showPlatformMcMap = new Map(
    resolvedShowPlatforms.map((sp) => [sp.uid, sp])
  );

  return {
    mcMap,
    platformMap,
    showMap,
    showPlatformMcMap,
  };
}

function getUniqueIds(showPlatformMcs: PatchBulkShowPlatformMcSchema[]) {
  const showPlatformMcIds: string[] = [];
  const showIds = new Set<string>();
  const platformIds = new Set<string>();
  const mcIds = new Set<string>();

  showPlatformMcs.forEach((payload) => {
    showPlatformMcIds.push(payload.show_platform_mc_uid);

    if (payload.show_uid) {
      showIds.add(payload.show_uid);
    }

    if (payload.platform_uid) {
      platformIds.add(payload.platform_uid);
    }

    if (payload.mc_uid) {
      mcIds.add(payload.mc_uid);
    }
  });

  return {
    showIds: Array.from(showIds),
    platformIds: Array.from(platformIds),
    mcIds: Array.from(mcIds),
    showPlatformMcIds: Array.from(new Set(showPlatformMcIds)),
  };
}
