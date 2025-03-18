import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./brands.routes";
import { and, count, eq, isNull } from "drizzle-orm";
import db from "@/db";
import { brand } from "@/db/schema";
import * as HttpStatusCodes from "@/http-status-codes";
import * as HttpStatusPhrases from "@/http-status-phrases";
import { brandSerializer } from "@/serializers/brand.serializer";

// TODO: search objects by name
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit } = c.req.valid("query");
  const brands = await db.query.brand.findMany({
    limit,
    offset,
    orderBy: (brand, { asc }) => asc(brand.id),
    where: (fields, operators) => operators.isNull(fields.deletedAt),
  });
  const [{ count: total }] = await db
    .select({ count: count() })
    .from(brand)
    .where(isNull(brand.deletedAt));

  const data = brands.map(brandSerializer);

  return c.json(
    {
      object: "brand",
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
  const [inserted] = await db.insert(brand).values(payload).returning();

  return c.json(brandSerializer(inserted), HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const brand = await db.query.brand.findFirst({
    where: (fields, operators) =>
      operators.and(
        operators.eq(fields.uid, id),
        operators.isNull(fields.deletedAt)
      ),
  });

  if (!brand) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = brandSerializer(brand);

  return c.json(data, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");
  const [updated] = await db
    .update(brand)
    .set({ ...updates, updatedAt: new Date().toISOString() })
    .where(and(eq(brand.uid, id), isNull(brand.deletedAt)))
    .returning();

  if (!updated) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = brandSerializer(updated);

  return c.json(data, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const result = await db
    .update(brand) // soft delete
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(brand.uid, id))
    .returning();

  if (!result) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
