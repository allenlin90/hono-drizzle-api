import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./show-platform-materials.routes";

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
import { validateShowPlatformMaterialPatchPayload } from "@/helpers/show-platform-material/validatePatchPayload";

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

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id: show_platform_material_uid } = c.req.valid("param");

  const [showPlatformMaterialRecord] = await db
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
    .where(
      and(
        eq(showPlatformMaterial.uid, show_platform_material_uid),
        isNull(showPlatformMaterial.deleted_at)
      )
    )
    .limit(1);

  if (!showPlatformMaterialRecord) {
    return c.json(
      {
        message: "show-platform-material not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(
    showPlatformMaterialSerializer(showPlatformMaterialRecord),
    HttpStatusCodes.OK
  );
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const searchData = c.req.valid("param");
  const jsonPayload = c.req.valid("json");
  const { show, platform, material, params, ...payload } = jsonPayload;

  const show_id = show?.id;
  const platform_id = platform?.id;
  const brand_material_id = material?.id;

  const isValidPayload = validateShowPlatformMaterialPatchPayload(
    searchData,
    jsonPayload
  );

  if (!isValidPayload) {
    return c.json(
      {
        message: "No changes detected",
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  let updated;
  try {
    const queryResult = await db
      .update(showPlatformMaterial)
      .set({
        show_id: show_id,
        platform_id: platform_id,
        brand_material_id: brand_material_id,
        ...payload,
      })
      .where(
        and(
          eq(showPlatformMaterial.uid, searchData.uid),
          isNull(showPlatformMaterial.deleted_at)
        )
      )
      .returning();

    updated = queryResult[0];
  } catch (error: any) {
    if (error.code === "23503") {
      return c.json(
        {
          message: "show-platform does not exist",
        },
        HttpStatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    if (error.code === "23505") {
      return c.json(
        {
          message: "material has already assigned to the show-platform",
        },
        HttpStatusCodes.UNPROCESSABLE_ENTITY
      );
    }
    throw error;
  }

  const platform_uid = platform?.uid ?? searchData.platform.uid;
  const show_uid = show?.uid ?? searchData.show.uid;
  const material_uid = material?.uid ?? searchData.material.uid;

  const data = {
    ...updated,
    show_uid,
    platform_uid,
    material_uid,
  };

  return c.json(
    selectShowPlatformMaterialSchema.parse(data),
    HttpStatusCodes.OK
  );
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: show_platform_material_uid } = c.req.valid("param");

  const [showPlatformMaterialRecord] = await db
    .update(showPlatformMaterial)
    .set({ deleted_at: new Date().toISOString() })
    .where(
      and(
        eq(showPlatformMaterial.uid, show_platform_material_uid),
        isNull(showPlatformMaterial.deleted_at)
      )
    )
    .returning();

  if (!showPlatformMaterialRecord) {
    return c.json(
      {
        message: "show-platform-material not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
