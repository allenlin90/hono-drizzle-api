import type { AppRouteHandler } from "@/lib/types";
import type { ListRoute } from "./shows.routes";
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
  const startTime = start_time ? gte(show.startTime, start_time) : undefined;
  const endTime = end_time ? gte(show.endTime, end_time) : undefined;
  const brandUid = brand_id ? eq(brand.uid, brand_id) : undefined;
  const activeBrands = isNull(brand.deletedAt);
  const filters = and(activeBrands, ilikeByName, startTime, endTime, brandUid);

  const shows = await db
    .select({
      ...getTableColumns(show),
      brand_id: brand.uid,
    })
    .from(show)
    .innerJoin(brand, eq(show.brandId, brand.id))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(show.createdAt));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(show)
    .innerJoin(brand, eq(show.brandId, brand.id))
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
