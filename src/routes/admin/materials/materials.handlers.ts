import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./materials.routes";
import { and, count, eq, getTableColumns, ilike, isNull } from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import { brand, brandMaterial } from "@/db/schema";
import { brandMaterialSerializer } from "@/serializers/admin/brand-material.serializer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, brand_id, name, type, is_active } =
    c.req.valid("query");

  const ilikeByName = name ? ilike(brandMaterial.name, `%${name}%`) : undefined;
  const brandUid = brand_id ? eq(brand.uid, brand_id) : undefined;
  const isActive =
    is_active !== undefined
      ? eq(brandMaterial.is_active, is_active)
      : undefined;
  const materialType = type ? eq(brandMaterial.type, type) : undefined;

  const filters = and(ilikeByName, brandUid, isActive, materialType);

  const brandMaterials = await db
    .select({
      ...getTableColumns(brandMaterial),
      brand_uid: brand.uid,
    })
    .from(brandMaterial)
    .innerJoin(brand, eq(brandMaterial.brand_id, brand.id))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(brandMaterial.created_at);

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(brandMaterial)
    .innerJoin(brand, eq(brandMaterial.brand_id, brand.id))
    .where(filters);

  const data = brandMaterials.map(brandMaterialSerializer);

  return c.json(
    {
      object: "brand-material",
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
    .insert(brandMaterial)
    .values({
      ...payload,
      brand_id: selectBrand.id,
    })
    .returning();

  return c.json(
    brandMaterialSerializer({ ...inserted, brand_uid: payload.brand_uid }),
    HttpStatusCodes.CREATED
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const [brandMaterialData] = await db
    .select({
      ...getTableColumns(brandMaterial),
      brand_uid: brand.uid,
    })
    .from(brandMaterial)
    .innerJoin(brand, eq(brandMaterial.brand_id, brand.id))
    .where(and(eq(brandMaterial.uid, id), isNull(brand.deleted_at)))
    .limit(1);

  if (!brandMaterialData) {
    return c.json(
      {
        message: "Show not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(brandMaterialSerializer(brandMaterialData), HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id: brand_material_uid } = c.req.valid("param");
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
    .update(brandMaterial)
    .set({
      ...payload,
      ...(selectBrand && { brand_id: selectBrand?.id }),
    })
    .from(brand)
    .where(
      and(
        eq(brandMaterial.uid, brand_material_uid),
        byBrandUid,
        isNull(brandMaterial.deleted_at)
      )
    )
    .returning({
      ...getTableColumns(brandMaterial),
      brand_uid: brand.uid,
    });

  if (!updated) {
    return c.json(
      {
        message: "Brand material not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(brandMaterialSerializer(updated), HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: show_uid } = c.req.valid("param");

  // TODO: remove associated data, e.g. show_platform_material
  const result = await db
    .update(brandMaterial)
    .set({ deleted_at: new Date().toISOString() })
    .where(
      and(eq(brandMaterial.uid, show_uid), isNull(brandMaterial.deleted_at))
    )
    .returning();

  if (!result.length) {
    return c.json(
      {
        message: "Brand material not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
