import type { PatchBulkShowSchema } from "@/db/schema/show.schema";
import type { createUpdateSchema } from "drizzle-zod";
import { z } from "@hono/zod-openapi";
import { and, getTableColumns, inArray, isNull, sql, SQL } from "drizzle-orm";

import db from "@/db";
import { brand, show } from "@/db/schema";

type Show = PatchBulkShowSchema;

type ShowToUpdate = z.infer<
  ReturnType<typeof createUpdateSchema<typeof show>>
> & { id: number };

type Error = { message: string; payload: Show };

type BulkUpsertShows = {
  shows: Show[];
};

export const bulkUpsertShows = async ({ shows }: BulkUpsertShows) => {
  const { errors, dataToUpdate, resolvedIds } = await validateUpdateShowPayload(
    { shows }
  );

  if (dataToUpdate.length === 0) {
    return {
      errors,
      updatedShows: [],
      resolvedIds,
    };
  }

  const { showIds, brandIdQuery, nameQuery, endTimeQuery, startTimeQuery } =
    generateUpdateQuery(dataToUpdate);
  const updatedAt = new Date().toISOString();

  const updatedShows = await db.transaction(async (tx) => {
    return tx
      .update(show)
      .set({
        brand_id: brandIdQuery,
        name: nameQuery,
        start_time: startTimeQuery,
        end_time: endTimeQuery,
        updated_at: updatedAt,
      })
      .where(and(inArray(show.id, showIds), isNull(show.deleted_at)))
      .returning();
  });

  return {
    errors,
    updatedShows,
    resolvedIds,
  };
};

function generateUpdateQuery(dataToUpdate: ShowToUpdate[]) {
  const showIds: number[] = [];
  const brandIdChunks: SQL[] = [sql`(case`];
  const startTimeChunks: SQL[] = [sql`(case`];
  const endTimeChunks: SQL[] = [sql`(case`];
  const nameChunks: SQL[] = [sql`(case`];

  dataToUpdate.forEach((showPayload) => {
    showIds.push(showPayload.id);

    if (showPayload.brand_id) {
      brandIdChunks.push(
        sql`when ${show.id} = ${showPayload.id} then ${showPayload.brand_id}`
      );
    }

    if (showPayload.name) {
      nameChunks.push(
        sql`when ${show.id} = ${showPayload.id} then ${showPayload.name}`
      );
    }

    if (showPayload.start_time) {
      startTimeChunks.push(
        sql`when ${show.id} = ${showPayload.id} then ${showPayload.start_time}`
      );
    }

    if (showPayload.end_time) {
      endTimeChunks.push(
        sql`when ${show.id} = ${showPayload.id} then ${showPayload.end_time}`
      );
    }
  });

  brandIdChunks.push(sql`else ${show.brand_id} end)`);
  nameChunks.push(sql`else ${show.name} end)`);
  startTimeChunks.push(sql`else ${show.start_time} end)`);
  endTimeChunks.push(sql`else ${show.end_time} end)`);

  return {
    brandIdQuery: sql.join(brandIdChunks, sql.raw(" ")),
    nameQuery: sql.join(nameChunks, sql.raw(" ")),
    startTimeQuery: sql.join(startTimeChunks, sql.raw(" ")),
    endTimeQuery: sql.join(endTimeChunks, sql.raw(" ")),
    showIds,
  };
}

async function validateUpdateShowPayload({ shows }: BulkUpsertShows) {
  const ids = getUniqueIds(shows);
  const resolvedIds = await resolveUIDs(ids);

  await validateUpdatedShows({ ids, resolvedIds });

  const { showMap, brandMap } = resolvedIds;
  const errors: Error[] = [];
  const dataToUpdate: ShowToUpdate[] = [];

  shows.forEach((payload) => {
    const { brand_uid, show_uid, ...showPayload } = payload;

    if (brand_uid) {
      const brand = brandMap.get(brand_uid);

      if (!brand) {
        errors.push({
          message: `Brand with UID ${brand_uid} not found.`,
          payload,
        });
        return;
      }
    }

    const show = showMap.get(show_uid);

    if (!show) {
      errors.push({
        message: `Show with UID ${show_uid} not found.`,
        payload,
      });
      return;
    }

    dataToUpdate.push({
      id: show.id,
      uid: show.uid,
      ...showPayload,
      ...(brand_uid && { brand_id: brandMap.get(brand_uid)!.id }),
    });
  });

  return {
    errors,
    dataToUpdate,
    resolvedIds,
  };
}

/**
 *
 * validate overall duration of updated shows
 * to prevent duplicate/redundant shows
 *
 * if duration of shows from a brand over purchased hours
 * if duration of shows during the time over capacity (e.g. studio, studio-room capacity)
 */
async function validateUpdatedShows({
  ids,
  resolvedIds,
}: {
  ids: ReturnType<typeof getUniqueIds>;
  resolvedIds: Awaited<ReturnType<typeof resolveUIDs>>;
}) {}

async function resolveUIDs({
  brandIds,
  showIds,
}: ReturnType<typeof getUniqueIds>) {
  const brandsQuery = db
    .select({ ...getTableColumns(brand) })
    .from(brand)
    .where(and(inArray(brand.uid, brandIds), isNull(brand.deleted_at)));

  const showsQuery = await db
    .select({
      ...getTableColumns(show),
      duration: sql<number>`EXTRACT(EPOCH FROM (${show.end_time} - ${show.start_time}))`, // duration in seconds
    })
    .from(show)
    .where(and(inArray(show.uid, showIds), isNull(show.deleted_at)));

  const [brands, shows] = await Promise.all([brandsQuery, showsQuery]);

  const brandMap = new Map<string, (typeof brands)[0]>(
    brands.map((brand) => [brand.uid, brand])
  );
  const showMap = new Map<string, (typeof shows)[0]>(
    shows.map((show) => [show.uid, show])
  );

  return { brandMap, showMap };
}

function getUniqueIds(shows: Show[]) {
  const showIds = shows.map((show) => show.show_uid);
  const brandIds = shows.reduce(
    (list, show) => (show.brand_uid ? [...list, show.brand_uid] : list),
    [] as string[]
  );

  return {
    brandIds: Array.from([...new Set(brandIds)]),
    showIds: Array.from([...new Set(showIds)]),
  };
}
