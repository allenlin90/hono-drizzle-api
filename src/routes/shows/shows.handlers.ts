import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
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
} from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import { brand, show } from "@/db/schema";
import { showSerializer } from "@/serializers/show.serailizer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, brand_id, name, start_time, end_time } =
    c.req.valid("query");

  const ilikeByName = name ? ilike(show.name, `%${name}%`) : undefined;
  const startTime = start_time ? gte(show.start_time, start_time) : undefined;
  const endTime = end_time ? gte(show.end_time, end_time) : undefined;
  const brandUid = brand_id ? eq(brand.uid, brand_id) : undefined;
  const activeBrands = isNull(brand.deleted_at);
  const filters = and(activeBrands, ilikeByName, startTime, endTime, brandUid);

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
  const idempotencyKey = c.req.valid("header")["Idempotency-Key"];

  if (!idempotencyKey) {
    return c.json(
      {
        message: "idempotency key is required",
      },
      HttpStatusCodes.BAD_REQUEST
    );
  }

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
    .where(and(eq(show.uid, id), isNull(brand.deleted_at)))
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

  let selectBrand: { id: number } | null = null;
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
