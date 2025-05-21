import type { AppRouteHandler } from "@/lib/types";
import type {
  BulkInsertRoute,
  BulkUpsertRoute,
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./shows.routes";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  isNull,
  lte,
} from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import { brand, show } from "@/db/schema";
import { showSerializer } from "@/serializers/admin/shows/show.serializer";
import { bulkInsertShows } from "@/services/show/bulk-insert";
import { showBulkSerializer } from "@/serializers/admin/shows/show-bulk.serializer";
import { bulkUpsertShows } from "@/services/show/bulk-upsert";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, brand_id, name, start_time, end_time } =
    c.req.valid("query");

  const ilikeByName = name ? ilike(show.name, `%${name}%`) : undefined;
  const startTime = start_time ? gte(show.start_time, start_time) : undefined;
  const endTime = end_time ? lte(show.end_time, end_time) : undefined;
  const brandUid = brand_id ? eq(brand.uid, brand_id) : undefined;
  const activeShows = isNull(show.deleted_at);
  const activeBrands = isNull(brand.deleted_at);
  const filters = and(
    activeShows,
    activeBrands,
    ilikeByName,
    startTime,
    endTime,
    brandUid
  );

  const shows = await db
    .select({
      ...getTableColumns(show),
      brand_uid: brand.uid,
    })
    .from(show)
    .innerJoin(brand, eq(show.brand_id, brand.id))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(show.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(show)
    .innerJoin(brand, eq(show.brand_id, brand.id))
    .where(filters);

  const data = shows.map(showSerializer);

  return c.json(
    {
      object: "show",
      data,
      limit,
      offset,
      total,
    },
    HttpStatusCodes.OK
  );
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const payload = c.req.valid("json");

  const [selectBrand] = await db
    .select({ id: brand.id })
    .from(brand)
    .where(and(eq(brand.uid, payload.brand_uid), isNull(brand.deleted_at)))
    .limit(1);

  if (!selectBrand) {
    return c.json(
      {
        message: "Brand not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const [inserted] = await db
    .insert(show)
    .values({
      ...payload,
      brand_id: selectBrand.id,
    })
    .returning();

  return c.json(
    showSerializer({ ...inserted, brand_uid: payload.brand_uid }),
    HttpStatusCodes.CREATED
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const [showData] = await db
    .select({
      ...getTableColumns(show),
      brand_uid: brand.uid,
    })
    .from(show)
    .innerJoin(brand, eq(show.brand_id, brand.id))
    .where(
      and(eq(show.uid, id), isNull(brand.deleted_at), isNull(show.deleted_at))
    )
    .limit(1);

  if (!showData) {
    return c.json(
      {
        message: "Show not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(showSerializer(showData), HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id: show_uid } = c.req.valid("param");
  const payload = c.req.valid("json");

  let selectBrand: { id: number; } | null = null;
  let byBrandUid = payload.brand_uid
    ? eq(brand.uid, payload.brand_uid)
    : undefined;

  if (payload.brand_uid) {
    const result = await db
      .select({ id: brand.id })
      .from(brand)
      .where(and(byBrandUid, isNull(brand.deleted_at)))
      .limit(1);

    selectBrand = result[0];

    if (!selectBrand) {
      return c.json(
        {
          message: "Brand not found",
        },
        HttpStatusCodes.NOT_FOUND
      );
    }
  }

  const [updated] = await db
    .update(show)
    .set({
      ...payload,
      ...(selectBrand && { brand_id: selectBrand?.id }),
    })
    .from(brand)
    .where(and(eq(show.uid, show_uid), byBrandUid, isNull(show.deleted_at)))
    .returning({
      ...getTableColumns(show),
      brand_uid: brand.uid,
    });

  if (!updated) {
    return c.json(
      {
        message: "Show not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(showSerializer(updated), HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: show_uid } = c.req.valid("param");

  // TODO: remove associated data, e.g. show_platform
  const result = await db
    .update(show)
    .set({ deleted_at: new Date().toISOString() })
    .where(and(eq(show.uid, show_uid), isNull(show.deleted_at)))
    .returning();

  if (!result.length) {
    return c.json(
      {
        message: "Show not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const bulkInsert: AppRouteHandler<BulkInsertRoute> = async (c) => {
  const { shows } = c.req.valid("json");

  const { errors, insertedShows, resolvedIds } = await bulkInsertShows({
    shows,
  });

  const serializedShows = await showBulkSerializer({
    insertedShows,
    resolvedIds,
  });

  return c.json(
    { errors, shows: serializedShows },
    HttpStatusCodes.MULTI_STATUS
  );
};

export const bulkUpsert: AppRouteHandler<BulkUpsertRoute> = async (c) => {
  const { shows } = c.req.valid("json");

  const { errors, updatedShows, resolvedIds } = await bulkUpsertShows({
    shows,
  });

  const serializedShows = await showBulkSerializer({
    insertedShows: updatedShows,
    resolvedIds,
  });

  return c.json(
    { errors, shows: serializedShows },
    HttpStatusCodes.MULTI_STATUS
  );
};
