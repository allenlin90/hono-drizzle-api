import type { insertShowSchema } from "@/db/schema/show.schema";
import { z } from "@hono/zod-openapi";
import { and, getTableColumns, inArray, isNull } from "drizzle-orm";

import db from "@/db";
import { brand, show } from "@/db/schema";

type Show = z.infer<typeof insertShowSchema>;
type ShowToInsert = Omit<Show, "brand_uid"> & {
  brand_id: number;
};
type Error = { message: string; payload: Show };

type BulkInsertShows = {
  shows: Show[];
};

export const bulkInsertShows = async ({ shows }: BulkInsertShows) => {
  const { errors, dataToCreate, resolvedIds } = await validateShowPayload({
    shows,
  });

  if (dataToCreate.length === 0) {
    return {
      errors,
      insertedShows: [],
      resolvedIds,
    };
  }

  // TODO: handle insertion errors
  const insertedShows = await db.transaction(async (tx) => {
    return tx.insert(show).values(dataToCreate).returning();
  });

  return {
    errors,
    insertedShows,
    resolvedIds,
  };
};

async function validateShowPayload({ shows }: BulkInsertShows) {
  const ids = getUniqueIds(shows);
  const resolvedIds = await resolveUIDs(ids);

  await validateOverallDuration({ ids, resolvedIds });

  const { brandMap } = resolvedIds;
  const errors: Error[] = [];
  const dataToCreate: ShowToInsert[] = [];

  shows.forEach((payload) => {
    const { brand_uid, ...showPayload } = payload;
    const brand = brandMap.get(brand_uid);

    if (!brand) {
      errors.push({
        message: `Brand with UID ${brand_uid} not found.`,
        payload,
      });
      return;
    }

    dataToCreate.push({
      ...showPayload,
      brand_id: brand.id,
    });
  });

  return {
    errors,
    dataToCreate,
    resolvedIds,
  };
}

/**
 * validates the overall duration of the shows
 * to prevent duplicate/redundant shows
 *
 * if duration of shows from a brand over purchased hours
 * if duration of shows during the time over capacity (e.g. studio, studio-room capacity)
 */
async function validateOverallDuration({
  ids,
  resolvedIds,
}: {
  ids: ReturnType<typeof getUniqueIds>;
  resolvedIds: Awaited<ReturnType<typeof resolveUIDs>>;
}) {}

async function resolveUIDs({ brandIds }: ReturnType<typeof getUniqueIds>) {
  const brands = await db
    .select({
      ...getTableColumns(brand),
    })
    .from(brand)
    .where(and(inArray(brand.uid, brandIds), isNull(brand.deleted_at)));

  const brandMap = new Map(brands.map((brand) => [brand.uid, brand]));

  return {
    brandMap,
  };
}

function getUniqueIds(showsPayload: Show[]) {
  const brandIds = showsPayload.map((payload) => payload.brand_uid);

  return {
    brandIds: Array.from(new Set([...brandIds])),
  };
}
