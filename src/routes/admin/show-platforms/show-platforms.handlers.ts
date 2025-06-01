import type { AppRouteHandler } from "@/lib/types";
import type {
  BulkInsertRoute,
  BulkUpdateRoute,
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./show-platforms.routes";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  isNotNull,
  isNull,
} from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import {
  showPlatform,
  show,
  platform,
  member,
  formTemplate
} from "@/db/schema";
import { bulkInsertShowPlatform } from "@/services/show-platform/bulk-insert";
import { showPlatformSerializer } from "@/serializers/admin/show-platforms/show-platform.serializer";
import { showPlatformBulkSerializer } from "@/serializers/admin/show-platforms/show-platform-bulk.serializer";
import { bulkUpdateShowPlatform } from "@/services/show-platform/bulk-update";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const {
    offset,
    limit,
    platform_id,
    show_id,
    ext_id,
    is_active,
    platform_name,
    show_name,
  } = c.req.valid("query");

  const isApproved =
    is_active !== undefined ? eq(showPlatform.is_active, is_active) : undefined;

  const ilikeByExtId = ext_id ? ilike(showPlatform.ext_id, `%${ext_id}%`) : undefined;
  const ilikeByPlatformUid = platform_id
    ? ilike(platform.uid, `%${platform_id}%`)
    : undefined;
  const ilikeByShowUid = show_id ? ilike(show.uid, `%${show_id}%`) : undefined;
  const ilikeByPlatformName = platform_name
    ? ilike(platform.name, `%${platform_name}%`)
    : undefined;
  const ilikeByShowName = show_name
    ? ilike(show.name, `%${show_name}%`)
    : undefined;

  const activePlatforms = isNull(platform.deleted_at);
  const activeShowPlatforms = isNull(showPlatform.deleted_at);
  const activeShows = isNull(show.deleted_at);
  const filters = and(
    activePlatforms,
    activeShowPlatforms,
    activeShows,
    isApproved,
    ilikeByExtId,
    ilikeByPlatformUid,
    ilikeByShowUid,
    ilikeByPlatformName,
    ilikeByShowName,
  );

  const showPlatforms = await db
    .select({
      ...getTableColumns(showPlatform),
      platform_uid: platform.uid,
      show_uid: show.uid,
      review_items: showPlatform.review_items as any,
      reviewer_uid: member.uid,
      review_form_uid: formTemplate.uid,
    })
    .from(showPlatform)
    .innerJoin(
      show,
      and(eq(showPlatform.show_id, show.id), isNull(show.deleted_at))
    )
    .innerJoin(
      platform,
      and(eq(showPlatform.platform_id, platform.id), isNull(platform.deleted_at))
    )
    .innerJoin(
      member,
      and(
        eq(showPlatform.reviewer_id, member.id),
        isNull(member.deleted_at)
      )
    )
    .innerJoin(
      formTemplate,
      and(
        eq(showPlatform.review_form_id, formTemplate.id),
        isNull(formTemplate.deleted_at)
      )
    )
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(showPlatform.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(showPlatform)
    .innerJoin(
      show,
      and(eq(showPlatform.show_id, show.id), isNull(show.deleted_at))
    )
    .innerJoin(
      platform,
      and(eq(showPlatform.platform_id, platform.id), isNull(platform.deleted_at))
    )
    .where(filters);

  const data = showPlatforms.map((sp) => showPlatformSerializer(sp));

  return c.json(
    {
      object: "show-platform",
      data,
      limit,
      offset,
      total,
    },
    HttpStatusCodes.OK
  );
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { is_active, ...payload } = c.req.valid("json");

  const show = payload.show!;
  const platform = payload.platform!;
  const reviewForm = payload.review_form;
  const reviewer = payload.reviewer;
  const params = payload.params;

  const [inserted] = await db
    .insert(showPlatform)
    .values({
      ...params,
      show_id: show.id,
      platform_id: platform.id,
      review_form_id: reviewForm?.id ?? null,
      reviewer_id: reviewer?.id ?? null,
      ...(is_active && { is_active }),
    })
    .onConflictDoUpdate({
      target: [showPlatform.show_id, showPlatform.platform_id],
      set: {
        is_active: is_active ?? false,
        show_id: show.id,
        platform_id: platform.id,
        deleted_at: null,
      },
      setWhere: isNotNull(showPlatform.deleted_at),
    })
    .returning();

  if (!inserted) {
    return c.json(
      { message: "The show-platform exists" },
      HttpStatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const data = {
    ...inserted,
    review_items: inserted.review_items as any,
    platform_uid: platform.uid,
    show_uid: show.uid,
    reviewer_uid: reviewer?.uid ?? null,
    review_form_uid: reviewForm?.uid ?? null,
  };

  return c.json(showPlatformSerializer(data), HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id: show_platform_uid } = c.req.valid("param");

  const [showPlatformData] = await db
    .select({
      ...getTableColumns(showPlatform),
      platform_uid: platform.uid,
      show_uid: show.uid,
      review_items: showPlatform.review_items as any,
      reviewer_uid: member.uid,
      review_form_uid: formTemplate.uid,
    })
    .from(showPlatform)
    .innerJoin(
      show,
      and(eq(showPlatform.show_id, show.id), isNull(show.deleted_at))
    )
    .innerJoin(
      platform,
      and(
        eq(showPlatform.platform_id, platform.id),
        isNull(platform.deleted_at)
      )
    )
    .where(
      and(
        eq(showPlatform.uid, show_platform_uid),
        isNull(showPlatform.deleted_at)
      )
    );

  if (!showPlatformData) {
    return c.json(
      { message: "Show-platform not found" },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(showPlatformSerializer(showPlatformData), HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const searchData = c.req.valid("param");

  const {
    show,
    platform,
    reviewer,
    review_form,
    params,
    ...payload
  } = c.req.valid("json");

  const show_id = show?.id;
  const platform_id = platform?.id;
  const reviewer_id = reviewer?.id;
  const review_form_id = review_form?.id;

  const [showPlatformData] = await db
    .update(showPlatform)
    .set({
      ...payload,
      ...(show_id && { show_id }),
      ...(platform_id && { platform_id }),
      ...(reviewer_id && { reviewer_id }),
      ...(review_form_id && { review_form_id }),
    })
    .where(
      and(
        eq(showPlatform.show_id, searchData.show_id),
        eq(showPlatform.platform_id, searchData.platform_id),
        isNull(showPlatform.deleted_at)
      )
    )
    .returning();

  const platform_uid = platform?.uid ?? searchData.platform_uid;
  const show_uid = show?.uid ?? searchData.show_uid;
  const reviewer_uid = reviewer?.uid ?? null;
  const review_form_uid = review_form?.uid ?? null;

  const data = {
    ...showPlatformData,
    review_items: showPlatformData.review_items as any,
    platform_uid,
    show_uid,
    reviewer_uid,
    review_form_uid,
  };
  return c.json(showPlatformSerializer(data), HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: show_platform_id } = c.req.valid("param");

  // TODO: remove associated data, e.g. show_platform_mc
  const [showPlatformData] = await db
    .update(showPlatform)
    .set({ deleted_at: new Date().toISOString() })
    .where(
      and(
        eq(showPlatform.uid, show_platform_id),
        isNull(showPlatform.deleted_at)
      )
    )
    .returning();

  if (!showPlatformData) {
    return c.json(
      { message: "Show-platform not found" },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const bulkInsert: AppRouteHandler<BulkInsertRoute> = async (c) => {
  const { show_platforms: showPlatforms } = c.req.valid("json");

  const { errors, insertedShowPlatforms, resolvedIds } =
    await bulkInsertShowPlatform({
      showPlatforms,
    });

  const serializedShowPlatforms = await showPlatformBulkSerializer({
    insertedShowPlatforms,
    resolvedIds,
  });

  return c.json(
    {
      errors,
      showPlatforms: serializedShowPlatforms,
    },
    HttpStatusCodes.MULTI_STATUS
  );
};

export const bulkUpdate: AppRouteHandler<BulkUpdateRoute> = async (c) => {
  const { show_platforms: showPlatforms } = c.req.valid("json");

  const { errors, updatedShowPlatforms, resolvedIds } =
    await bulkUpdateShowPlatform({ showPlatforms });

  const serializedShowPlatforms = await showPlatformBulkSerializer({
    insertedShowPlatforms: updatedShowPlatforms,
    resolvedIds,
  });

  return c.json(
    { errors, showPlatforms: serializedShowPlatforms },
    HttpStatusCodes.MULTI_STATUS
  );
};
