import type { AppRouteHandler } from "@/lib/types";
import { and, asc, getTableColumns, ilike, isNull } from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import * as HttpStatusPhrases from "@/http-status-phrases";
import db from "@/db";
import { platform } from "@/db/schema";
import platformSerializer from "@/serializers/platform.serializer";
import type { CreateRoute, GetOneRoute, ListRoute } from "./platforms.routes";

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

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const platform = await db.query.platform.findFirst({
    where: (fields, operators) =>
      operators.and(
        operators.eq(fields.uid, id),
        operators.isNull(fields.deleted_at)
      ),
  });

  if (!platform) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = platformSerializer(platform);

  return c.json(data, HttpStatusCodes.OK);
};
