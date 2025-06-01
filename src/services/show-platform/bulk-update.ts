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
import { platform, show, showPlatform, member, formTemplate } from "@/db/schema";

type uidKeys = "showPlatformIds" | "platformIds" | "showIds" | "reviewerIds" | "reviewFormIds";

type Error = { message: string; payload: PatchBulkShowPlatformSchema; };

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
    isActiveQuery,
    reviewerIdQuery,
    reviewFormIdQuery,
    extIdQuery,
    noteQuery,
  } = generateUpdateQuery(dataToUpdate);

  const updatedShowPlatforms = await db.transaction(async (tx) => {
    return tx
      .update(showPlatform)
      .set({
        show_id: showIdQuery,
        platform_id: platformIdQuery,
        is_active: isActiveQuery,
        reviewer_id: reviewerIdQuery,
        review_form_id: reviewFormIdQuery,
        ext_id: extIdQuery,
        note: noteQuery,
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
  const reviewerIdChunks: SQL[] = [sql`(case`];
  const reviewFormIdChunks: SQL[] = [sql`(case`];
  const isActiveChunks: SQL[] = [sql`(case`];
  const extIdChunks: SQL[] = [sql`(case`];
  const noteChunks: SQL[] = [sql`(case`];

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

    if (payload.reviewer_id) {
      reviewerIdChunks.push(
        sql`when ${showPlatform.uid} = ${payload.uid} then ${payload.reviewer_id}`
      );
    }

    if (payload.is_active !== undefined) {
      isActiveChunks.push(
        sql`when ${showPlatform.uid} = ${payload.uid} then ${payload.is_active}`
      );
    }

    if (payload.review_form_id) {
      reviewFormIdChunks.push(
        sql`when ${showPlatform.uid} = ${payload.uid} then ${payload.review_form_id}`
      );
    }

    if (payload.ext_id) {
      extIdChunks.push(
        sql`when ${showPlatform.uid} = ${payload.uid} then ${payload.ext_id}`
      );
    }

    if (payload.note) {
      noteChunks.push(
        sql`when ${showPlatform.uid} = ${payload.uid} then ${payload.note}`
      );
    }
  });

  showIdChunks.push(sql`else ${showPlatform.show_id} end)`);
  platformIdChunks.push(sql`else ${showPlatform.platform_id} end)`);
  isActiveChunks.push(sql`else ${showPlatform.is_active} end)`);
  reviewerIdChunks.push(sql`else ${showPlatform.reviewer_id} end)`);
  reviewFormIdChunks.push(sql`else ${showPlatform.review_form_id} end)`);
  extIdChunks.push(sql`else ${showPlatform.ext_id} end)`);
  noteChunks.push(sql`else ${showPlatform.note} end)`);

  return {
    showIdQuery:
      showIdChunks.length > 2
        ? sql.join(showIdChunks, sql.raw(" "))
        : undefined,
    platformIdQuery:
      platformIdChunks.length > 2
        ? sql.join(platformIdChunks, sql.raw(" "))
        : undefined,
    isActiveQuery:
      isActiveChunks.length > 2
        ? sql.join(isActiveChunks, sql.raw(" "))
        : undefined,
    reviewerIdQuery:
      reviewerIdChunks.length > 2
        ? sql.join(reviewerIdChunks, sql.raw(" "))
        : undefined,
    reviewFormIdQuery:
      reviewFormIdChunks.length > 2
        ? sql.join(reviewFormIdChunks, sql.raw(" "))
        : undefined,
    extIdQuery:
      extIdChunks.length > 2
        ? sql.join(extIdChunks, sql.raw(" "))
        : undefined,
    noteQuery:
      noteChunks.length > 2
        ? sql.join(noteChunks, sql.raw(" "))
        : undefined,
  };
}

async function validateUpdateShowPlatformPayload({
  showPlatforms,
}: BulkUpdateShowPlatform) {
  const ids = getUniqueIds(showPlatforms);
  const resolvedIds = await resolveUIDs(ids);

  await validateOverallDuration({ ids, resolvedIds });

  const { showMap, platformMap, reviewerMap, reviewFormMap, showPlatformMap } = resolvedIds;
  const errors: Error[] = [];
  const dataToUpdate: ShowPlatformToUpdate[] = [];

  showPlatforms.forEach((sp) => {
    const {
      show_platform_uid,
      show_uid,
      platform_uid,
      reviewer_uid,
      review_form_uid,
      ...restPayload
    } = sp;
    const errorMessage: string[] = [];

    if (show_platform_uid && !showPlatformMap.has(show_platform_uid)) {
      errorMessage.push(`Show platform with uid ${show_platform_uid} not found`);
    }
    if (show_uid && !showMap.has(show_uid)) {
      errorMessage.push(`Show with uid ${show_uid} not found`);
    }
    if (platform_uid && !platformMap.has(platform_uid)) {
      errorMessage.push(`Platform with uid ${platform_uid} not found`);
    }
    if (reviewer_uid && !reviewerMap.has(reviewer_uid)) {
      errorMessage.push(`Reviewer with uid ${reviewer_uid} not found`);
    }
    if (review_form_uid && !reviewFormMap.has(review_form_uid)) {
      errorMessage.push(
        `Review form with uid ${review_form_uid} not found`
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
      ...(reviewer_uid && {
        reviewer_id: reviewerMap.get(reviewer_uid)?.id,
      }),
      ...(review_form_uid && {
        review_form_id: reviewFormMap.get(review_form_uid)?.id,
      }),
      uid: show_platform_uid!,
      is_active: restPayload.is_active ?? false,
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
}) { }

async function resolveUIDs({
  showIds,
  platformIds,
  showPlatformIds,
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

  const reviewerByUID = db
    .select({
      ...getTableColumns(member),
    })
    .from(member)
    .where(
      and(inArray(member.uid, reviewerIds), isNull(member.deleted_at))
    );

  const reviewFormByUID = db
    .select({
      ...getTableColumns(formTemplate),
    })
    .from(formTemplate)
    .where(
      and(inArray(formTemplate.uid, reviewFormIds), isNull(formTemplate.deleted_at))
    );

  const [
    resolvedPlatforms,
    resolvedShowPlatforms,
    resolvedShows,
    resolvedReviewers,
    resolvedReviewForms,
  ] = await Promise.all([
    platformsByUID,
    showPlatformsByUID,
    showsByUID,
    reviewerByUID,
    reviewFormByUID,
  ]);

  const showMap = new Map(resolvedShows.map((s) => [s.uid, s]));
  const platformMap = new Map(resolvedPlatforms.map((p) => [p.uid, p]));
  const showPlatformMap = new Map(
    resolvedShowPlatforms.map((sp) => [sp.uid, sp])
  );
  const reviewerMap = new Map(resolvedReviewers.map((r) => [r.uid, r]));
  const reviewFormMap = new Map(resolvedReviewForms.map((rf) => [rf.uid, rf]));

  return {
    showMap,
    platformMap,
    showPlatformMap,
    reviewerMap,
    reviewFormMap,
  };
}

function getUniqueIds(
  showPlatforms: PatchBulkShowPlatformSchema[]
): Record<uidKeys, string[]> {
  const showPlatformIds = new Set<string>();
  const showIds = new Set<string>();
  const platformIds = new Set<string>();
  const reviewerIds = new Set<string>();
  const reviewFormIds = new Set<string>();

  for (const sp of showPlatforms) {
    if (sp.show_platform_uid) {
      showPlatformIds.add(sp.show_platform_uid);
    }
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
    showPlatformIds: Array.from(showPlatformIds),
    showIds: Array.from(showIds),
    platformIds: Array.from(platformIds),
    reviewerIds: Array.from(reviewerIds),
    reviewFormIds: Array.from(reviewFormIds),
  };
}
