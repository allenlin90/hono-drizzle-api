import type { createInsertSchema } from "drizzle-zod";
import type { InsertShowPlatformMcSchema } from "@/db/schema/show-platform-mc.schema";

import { z } from "@hono/zod-openapi";

import db from "@/db";
import { and, eq, getTableColumns, inArray, isNull, sql } from "drizzle-orm";
import { brand, mc, platform, show, showPlatformMc } from "@/db/schema";

type Error = { message: string; payload: InsertShowPlatformMcSchema };

type ShowPlatformMcToInsert = z.infer<
  ReturnType<typeof createInsertSchema<typeof showPlatformMc>>
>;

type BulkInsertShowPlatformMcs = {
  showPlatformMcs: InsertShowPlatformMcSchema[];
};

export const bulkInsertShowPlatformMc = async ({
  showPlatformMcs,
}: BulkInsertShowPlatformMcs) => {
  const { dataToInsert, errors, resolvedIds } =
    await validateShowPlatformMcPayload({ showPlatformMcs });

  if (dataToInsert.length === 0) {
    return {
      errors,
      resolvedIds,
      insertedShowPlatformMcs: [],
    };
  }

  const insertedShowPlatformMcs = await db.transaction(async (tx) => {
    return tx
      .insert(showPlatformMc)
      .values(dataToInsert)
      .onConflictDoUpdate({
        target: [
          showPlatformMc.show_id,
          showPlatformMc.platform_id,
          showPlatformMc.mc_id,
        ],
        set: {
          show_id: sql`excluded.show_id`,
          platform_id: sql`excluded.platform_id`,
          mc_id: sql`excluded.mc_id`,
          updated_at: new Date().toISOString(),
        },
      })
      .returning();
  });

  return { errors, resolvedIds, insertedShowPlatformMcs };
};

async function validateShowPlatformMcPayload({
  showPlatformMcs,
}: BulkInsertShowPlatformMcs) {
  const ids = getUniqueIds(showPlatformMcs);
  const resolvedIds = await resolveUIDs(ids);

  await validateMcConditions({ ids, resolvedIds });

  const { mcMap, platformMap, showMap } = resolvedIds;
  const errors: Error[] = [];
  const dataToInsert: ShowPlatformMcToInsert[] = [];

  showPlatformMcs.forEach((showPlatformMc) => {
    const errorMessage: string[] = [];
    const { mc_uid, platform_uid, show_uid, ...restPayload } = showPlatformMc;
    const mc = mcMap.get(mc_uid);
    const platform = platformMap.get(platform_uid);
    const show = showMap.get(show_uid);

    if (!mc) {
      errorMessage.push("mc not found");
    }

    if (!platform) {
      errorMessage.push("platform not found");
    }

    if (!show) {
      errorMessage.push("show not found");
    }

    if (errorMessage.length > 0) {
      errors.push({
        message: errorMessage.join(", "),
        payload: showPlatformMc,
      });
      return;
    }

    dataToInsert.push({
      ...restPayload,
      mc_id: mc!.id,
      platform_id: platform!.id,
      show_id: show!.id,
    });
  });

  return { errors, resolvedIds, dataToInsert };
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
  showIds,
  platformIds,
  mcIds,
}: ReturnType<typeof getUniqueIds>) {
  const showsByUID = db
    .select({
      ...getTableColumns(show),
      brand: {
        ...getTableColumns(brand),
      },
    })
    .from(show)
    .innerJoin(brand, eq(show.brand_id, brand.id))
    .where(
      and(
        inArray(show.uid, showIds),
        isNull(show.deleted_at),
        isNull(brand.deleted_at)
      )
    );

  const platformsByUID = db
    .select({ ...getTableColumns(platform) })
    .from(platform)
    .where(
      and(inArray(platform.uid, platformIds), isNull(platform.deleted_at))
    );

  const mcsByUID = db
    .select({ ...getTableColumns(mc) })
    .from(mc)
    .where(and(inArray(mc.uid, mcIds), isNull(mc.deleted_at)));

  const [resolvedShows, resolvedPlatforms, resolvedMcs] = await Promise.all([
    showsByUID,
    platformsByUID,
    mcsByUID,
  ]);

  const showMap = new Map(resolvedShows.map((s) => [s.uid, s]));
  const platformMap = new Map(resolvedPlatforms.map((p) => [p.uid, p]));
  const mcMap = new Map(resolvedMcs.map((m) => [m.uid, m]));

  return {
    showMap,
    platformMap,
    mcMap,
  };
}

function getUniqueIds(showPlatformMcs: InsertShowPlatformMcSchema[]) {
  const showIds = new Set<string>();
  const platformIds = new Set<string>();
  const mcIds = new Set<string>();

  showPlatformMcs.forEach((showPlatformMc) => {
    showIds.add(showPlatformMc.show_uid);
    platformIds.add(showPlatformMc.platform_uid);
    mcIds.add(showPlatformMc.mc_uid);
  });

  return {
    showIds: Array.from(showIds),
    platformIds: Array.from(platformIds),
    mcIds: Array.from(mcIds),
  };
}
