import type { AppRouteHandler } from "@/lib/types";
import { and, asc, getTableColumns, ilike, isNull } from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import * as HttpStatusPhrases from "@/http-status-phrases";
import db from "@/db";
import { platform } from "@/db/schema";
import platformSerializer from "@/serializers/platform.serializer";
import type { CreateRoute, ListRoute } from "./platforms.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, name } = c.req.valid("query");

  const ilikeByName = name ? ilike(platform.name, `%${name}%`) : undefined;
  const filters = and(isNull(platform.deleted_at), ilikeByName);

  const platforms = await db
    .select({ ...getTableColumns(platform) })
    .from(platform)
    .where(filters)
    .orderBy(asc(platform.id))
    .limit(limit)
    .offset(offset);

  const total = await db.$count(platform, filters);

  const data = platforms.map(platformSerializer);

  return c.json(
    {
      object: "platform",
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

  const [inserted] = await db.insert(platform).values(payload).returning();

  return c.json(platformSerializer(inserted), HttpStatusCodes.CREATED);
};
