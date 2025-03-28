import type { AppRouteHandler } from "@/lib/types";
import type { CreateRoute, ListRoute } from "./show-platform-materials.routes";

import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  isNotNull,
  isNull,
} from "drizzle-orm";

import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import {
  brand,
  brandMaterial,
  platform,
  show,
  showPlatformMaterial,
} from "@/db/schema";
import { showPlatformMaterialSerializer } from "@/serializers/show-platform-material.serializer";
import { selectShowPlatformMaterialSchema } from "@/db/schema/show-platform-material.schema";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const {
    offset,
    limit,
    show_id,
    platform_id,
    material_id,
    platform_name,
    show_name,
    material_name,
    material_type,
  } = c.req.valid("query");

  const ilikePlatformName = platform_name
    ? ilike(platform.name, platform_name)
    : undefined;
  const ilikeShowName = show_name ? ilike(show.name, show_name) : undefined;
  const ilikeMaterialName = material_name
    ? ilike(brandMaterial.name, material_name)
    : undefined;
  const queryByMaterialType = material_type
    ? eq(brandMaterial.type, material_type)
    : undefined;
  const queryByShowId = show_id ? eq(show.uid, show_id) : undefined;
  const queryByPlatformId = platform_id
    ? eq(platform.uid, platform_id)
    : undefined;
  const queryByMaterialId = material_id
    ? eq(brandMaterial.uid, material_id)
    : undefined;
  const activeBrands = isNull(brand.deleted_at);
  const activeShows = isNull(show.deleted_at);
  const activePlatforms = isNull(platform.deleted_at);
  const activeBrandMaterials = isNull(brandMaterial.deleted_at);
  const activeShowPlatformMaterials = isNull(showPlatformMaterial.deleted_at);
  const filters = and(
    ilikePlatformName,
    ilikeShowName,
    ilikeMaterialName,
    queryByMaterialType,
    queryByShowId,
    queryByPlatformId,
    queryByMaterialId,
    activeBrands,
    activeShows,
    activePlatforms,
    activeBrandMaterials,
    activeShowPlatformMaterials
  );

  const showPlatformMaterials = await db
    .select({
      ...getTableColumns(showPlatformMaterial),
      brand: {
        ...getTableColumns(brand),
      },
      material: {
        ...getTableColumns(brandMaterial),
      },
      show: {
        ...getTableColumns(show),
      },
      platform: {
        ...getTableColumns(platform),
      },
    })
    .from(showPlatformMaterial)
    .innerJoin(show, and(eq(show.id, showPlatformMaterial.show_id)))
    .innerJoin(platform, and(eq(platform.id, showPlatformMaterial.platform_id)))
    .innerJoin(
      brandMaterial,
      and(eq(brandMaterial.id, showPlatformMaterial.brand_material_id))
    )
    .innerJoin(brand, and(eq(brand.id, brandMaterial.brand_id)))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(showPlatformMaterial.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(showPlatformMaterial)
    .innerJoin(show, and(eq(show.id, showPlatformMaterial.show_id)))
    .innerJoin(platform, and(eq(platform.id, showPlatformMaterial.platform_id)))
    .innerJoin(
      brandMaterial,
      and(eq(brandMaterial.id, showPlatformMaterial.brand_material_id))
    )
    .innerJoin(brand, and(eq(brand.id, brandMaterial.brand_id)))
    .where(filters);

  const data = showPlatformMaterials.map(showPlatformMaterialSerializer);

  return c.json(
    {
      object: "show-platform-material",
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
  const show = payload.show!;
  const platform = payload.platform!;
  const material = payload.material!;

  let insertedShowPlatformMaterial;
  try {
    const queryResult = await db
      .insert(showPlatformMaterial)
      .values({
        show_id: show!.id!,
        platform_id: platform!.id!,
        brand_material_id: material!.id!,
      })
      .onConflictDoUpdate({
        target: [
          showPlatformMaterial.show_id,
          showPlatformMaterial.platform_id,
          showPlatformMaterial.brand_material_id,
        ],
        set: {
          show_id: show.id,
          platform_id: platform.id,
          brand_material_id: material.id,
          deleted_at: null,
        },
        setWhere: isNotNull(showPlatformMaterial.deleted_at),
      })
      .returning();

    insertedShowPlatformMaterial = queryResult[0];
  } catch (error: any) {
    if (error.code === "23503") {
      return c.json(
        {
          message: "show-platform does not exist",
        },
        HttpStatusCodes.UNPROCESSABLE_ENTITY
      );
    }
    throw error;
  }

  if (!insertedShowPlatformMaterial) {
    return c.json(
      {
        message: "The material has been assigned to the show-platform",
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  return c.json(
    selectShowPlatformMaterialSchema.parse({
      ...insertedShowPlatformMaterial,
      show_uid: show.uid,
      platform_uid: platform.uid,
      material_uid: material.uid,
    }),
    HttpStatusCodes.CREATED
  );
};
