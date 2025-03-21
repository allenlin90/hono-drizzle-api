import type { AppRouteHandler } from "@/lib/types";
import type { ListRoute } from "./materials.routes";
import { and, count, eq, getTableColumns, ilike } from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import { brand, brandMaterial } from "@/db/schema";
import { brandMaterialSerializer } from "@/serializers/brand-material.serializer";

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
