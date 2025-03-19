import type { AppRouteHandler } from "@/lib/types";
import type { CreateRoute, ListRoute } from "./shows.routes";
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
