import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./cities.routes";
import { and, asc, eq, getTableColumns, ilike, isNull } from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import * as HttpStatusPhrases from "@/http-status-phrases";
import db from "@/db";
import { city } from "@/db/schema";
import { citySerializer } from "@/serializers/city.serializer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, name } = c.req.valid("query");

  const ilikeByName = name ? ilike(city.name, `%${name}%`) : undefined;
  const filters = and(isNull(city.deleted_at), ilikeByName);

  const cities = await db
    .select({ ...getTableColumns(city) })
    .from(city)
    .where(filters)
    .orderBy(asc(city.id))
    .limit(limit)
    .offset(offset);

  const total = await db.$count(city, filters);

  const data = cities.map(citySerializer);

  return c.json(
    {
      object: "city",
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

  const [inserted] = await db.insert(city).values(payload).returning();

  return c.json(citySerializer(inserted), HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const city = await db.query.city.findFirst({
    where: (fields, operators) =>
      operators.and(
        operators.eq(fields.uid, id),
        operators.isNull(fields.deleted_at)
      ),
  });

  if (!city) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = citySerializer(city);

  return c.json(data, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");
  const [updated] = await db
    .update(city)
    .set({ ...updates, updated_at: new Date().toISOString() })
    .where(and(eq(city.uid, id), isNull(city.deleted_at)))
    .returning();

  if (!updated) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = citySerializer(updated);

  return c.json(data, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  // TODO: remove associated data, e.g. shows, materials
  const result = await db
    .update(city) // soft delete
    .set({ deleted_at: new Date().toISOString() })
    .where(and(eq(city.uid, id), isNull(city.deleted_at)))
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
