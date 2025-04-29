import type { AppRouteHandler } from "@/lib/types";
import { and, asc, eq, getTableColumns, ilike, isNull } from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import * as HttpStatusPhrases from "@/http-status-phrases";
import db from "@/db";
import { platform } from "@/db/schema";
import platformSerializer from "@/serializers/platform.serializer";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./platforms.routes";

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

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");
  const [updated] = await db
    .update(platform)
    .set({ ...updates, updated_at: new Date().toISOString() })
    .where(and(eq(platform.uid, id), isNull(platform.deleted_at)))
    .returning();

  if (!updated) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = platformSerializer(updated);

  return c.json(data, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  // TODO: remove associated data, e.g. show_platform
  const result = await db
    .update(platform) // soft delete
    .set({ deleted_at: new Date().toISOString() })
    .where(and(eq(platform.uid, id), isNull(platform.deleted_at)))
    .returning();

  if (!result.length) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
