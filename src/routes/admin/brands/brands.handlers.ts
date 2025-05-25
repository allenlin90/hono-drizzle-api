import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./brands.routes";
import { and, asc, eq, getTableColumns, ilike, isNotNull, isNull } from "drizzle-orm";
import db from "@/db";
import { brand } from "@/db/schema";
import * as HttpStatusCodes from "@/http-status-codes";
import * as HttpStatusPhrases from "@/http-status-phrases";
import { brandSerializer } from "@/serializers/admin/brand.serializer";
import { patchBrandSchema } from "@/db/schema/client.schema";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, name } = c.req.valid("query");

  const ilikeByName = name ? ilike(brand.name, `%${name}%`) : undefined;
  const filters = and(isNull(brand.deleted_at), ilikeByName);

  const brands = await db
    .select({ ...getTableColumns(brand) })
    .from(brand)
    .where(filters)
    .orderBy(asc(brand.id))
    .limit(limit)
    .offset(offset);

  const total = await db.$count(brand, filters);

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

  const [inserted] = await db
    .insert(brand)
    .values(payload)
    .onConflictDoUpdate(
      {
        target: [brand.name],
        set: {
          ...payload,
          deleted_at: null,
        },
        setWhere: isNotNull(brand.deleted_at),
      }
    )
    .returning();

  return c.json(brandSerializer(inserted), HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const brand = await db.query.brand.findFirst({
    where: (fields, operators) =>
      operators.and(
        operators.eq(fields.uid, id),
        operators.isNull(fields.deleted_at)
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
  const payload = c.req.valid("json");
  const updates = patchBrandSchema.parse(payload);

  const [updated] = await db
    .update(brand)
    .set({ ...updates, updated_at: new Date().toISOString() })
    .where(and(eq(brand.uid, id), isNull(brand.deleted_at)))
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

  // TODO: remove associated data, e.g. shows, materials
  const result = await db
    .update(brand) // soft delete
    .set({ deleted_at: new Date().toISOString() })
    .where(and(eq(brand.uid, id), isNull(brand.deleted_at)))
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
