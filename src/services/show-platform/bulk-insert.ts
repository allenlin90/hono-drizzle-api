import type { createInsertSchema } from "drizzle-zod";
import { z } from "@hono/zod-openapi";
import { and, eq, getTableColumns, inArray, isNull, sql } from "drizzle-orm";

import db from "@/db";
import { formTemplate, member, platform, show } from "@/db/schema";
import {
  showPlatform,
  type InsertShowPlatformSchema,
} from "@/db/schema/show-platform.schema";

type uidKeys = "platformIds" | "showIds" | 'reviewerIds' | "reviewFormIds";

type Error = { message: string; payload: InsertShowPlatformSchema; };

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

  if (dataToInsert.length === 0) {
    return {
      errors,
      resolvedIds,
      insertedShowPlatforms: [],
    };
  }

  const insertedShowPlatforms = await db.transaction(async (tx) => {
    return tx
      .insert(showPlatform)
      .values(dataToInsert)
      .onConflictDoUpdate({
        target: [showPlatform.show_id, showPlatform.platform_id],
        set: {
          show_id: sql`excluded.show_id`,
          platform_id: sql`excluded.platform_id`,
          is_active: sql`excluded.is_active`,
          ext_id: sql`case when excluded.ext_id is not null then excluded.ext_id else ${showPlatform.ext_id} end`,
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

  const { platformMap, showMap } = resolvedIds;
  const errors: Error[] = [];
  const dataToInsert: ShowPlatformToInsert[] = [];

  showPlatforms.forEach((payload) => {
    const errorMessage: string[] = [];
    const { platform_uid, show_uid, ...restPayload } = payload;
    const platform = platformMap.get(platform_uid);
    const show = showMap.get(show_uid);

    if (!platform) {
      errorMessage.push(`Platform with UID ${platform_uid} not found`);
    }

    if (!show) {
      errorMessage.push(`Show with UID ${show_uid} not found`);
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
}) { }

async function resolveUIDs({
  showIds,
  platformIds,
  reviewerIds,
  reviewFormIds,
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
    })
    .from(show)
    .where(and(inArray(show.uid, showIds), isNull(show.deleted_at)));

  const reviewersByUID = db
    .select({
      ...getTableColumns(member),
    })
    .from(member)
    .where(and(inArray(member.uid, reviewerIds), isNull(member.deleted_at)));

  const reviewFormsByUID = db
    .select({
      ...getTableColumns(formTemplate),
    })
    .from(formTemplate)
    .where(and(inArray(formTemplate.uid, reviewFormIds), isNull(formTemplate.deleted_at)));

  const [resolvedPlatforms, resolvedShows, resolvedReviewers, resolvedReviewForms] =
    await Promise.all([platformsByUID, showsByUID, reviewersByUID, reviewFormsByUID]);

  const showMap = new Map(resolvedShows.map((s) => [s.uid, s]));
  const platformMap = new Map(resolvedPlatforms.map((p) => [p.uid, p]));
  const reviewerMap = new Map(resolvedReviewers.map((r) => [r.uid, r]));
  const reviewFormMap = new Map(resolvedReviewForms.map((rf) => [rf.uid, rf]));

  return {
    showMap,
    platformMap,
    reviewerMap,
    reviewFormMap,
  };
}

function getUniqueIds(
  showPlatforms: InsertShowPlatformSchema[]
): Record<uidKeys, string[]> {
  const showIds = new Set<string>();
  const platformIds = new Set<string>();
  const reviewerIds = new Set<string>();
  const reviewFormIds = new Set<string>();

  for (const sp of showPlatforms) {
    if (sp.show_uid) {
      showIds.add(sp.show_uid);
    }
    if (sp.platform_uid) {
      platformIds.add(sp.platform_uid);
    }
    if (sp.reviewer_uid) {
      reviewerIds.add(sp.reviewer_uid);
    }
    if (sp.review_form_uid) {
      reviewFormIds.add(sp.review_form_uid);
    }
  }

  return {
    showIds: Array.from(showIds),
    platformIds: Array.from(platformIds),
    reviewerIds: Array.from(reviewerIds),
    reviewFormIds: Array.from(reviewFormIds),
  };
}
