import type { AppRouteHandler } from "@/lib/types";
import type {
  // GetMaterialsRoute, 
  // GetOneRoute, 
  ListRoute
} from "./shows.routes";

import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import {
  mc,
  platform,
  show,
  showPlatform,
  studioRoom,
} from "@/db/schema";
import {
  // showDetailsSerializer,
  showSerializer
} from "@/serializers/api/shows/show.serializer";
// import { showMaterialSerializer } from "@/serializers/api/shows/material.serializer";
import { and, eq, ilike, gte, lte, isNull, count, desc, getTableColumns } from "drizzle-orm";
import { showMc } from "@/db/schema/show-mc.schema";
import { client } from "@/db/schema/client.schema";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const {
    offset = 0,
    limit = 20,
    show_id,
    name: show_name,
    start_time,
    end_time,
  } = c.req.valid("query");

  const userId = c.get('jwtPayload')!.id;

  const [mcRecord] = await db
    .select({ id: mc.id })
    .from(mc)
    .where(and(eq(mc.ext_id, userId), isNull(mc.deleted_at)))
    .limit(1);

  if (!mcRecord) {
    return c.json({ message: 'MC not found' }, HttpStatusCodes.NOT_FOUND);
  }

  const showMcFilters = [
    eq(showMc.mc_id, mcRecord.id),
    eq(showMc.is_active, true),
    isNull(showMc.deleted_at),
  ];

  if (show_id) {
    showMcFilters.push(eq(showMc.show_id, Number(show_id)));
  }

  const showFilters = [isNull(show.deleted_at)];

  if (show_name) {
    showFilters.push(ilike(show.name, `%${show_name}%`));
  }

  if (start_time) {
    showFilters.push(gte(show.start_time, start_time));
  }

  if (end_time) {
    showFilters.push(lte(show.end_time, end_time));
  }

  // Query shows assigned to this MC
  const shows = await db
    .select({
      ...getTableColumns(show),
      client: { ...getTableColumns(client) },
      studio_room: { ...getTableColumns(studioRoom) },
    })
    .from(showMc)
    .innerJoin(show, and(eq(showMc.show_id, show.id), ...showFilters))
    .leftJoin(studioRoom, eq(show.studio_room_id, studioRoom.id))
    .leftJoin(client, eq(show.client_id, client.id))
    .where(and(...showMcFilters))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(show.start_time));

  // Count total for pagination
  const [{ count: total }] = await db
    .select({ count: count() })
    .from(showMc)
    .innerJoin(show, and(eq(showMc.show_id, show.id), ...showFilters))
    .where(and(...showMcFilters));

  const data = shows.map(showSerializer);

  return c.json({
    object: "show",
    data,
    limit,
    offset,
    total,
  }, HttpStatusCodes.OK);
};

// export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
//   const { id: show_uid } = c.req.valid("param");
//   const userId = c.get('jwtPayload')!.id;

//   const [showDetails] = await db
//     .select({
//       ...getTableColumns(showPlatformMc),
//       brand: { ...getTableColumns(brand) },
//       platform: { ...getTableColumns(platform) },
//       show_platform: { ...getTableColumns(showPlatform) },
//       show: { ...getTableColumns(show) },
//       studio_room: { ...getTableColumns(studioRoom) },
//     })
//     .from(showPlatformMc)
//     .innerJoin(showPlatform,
//       and(
//         eq(showPlatformMc.show_id, showPlatform.show_id),
//         eq(showPlatformMc.platform_id, showPlatform.platform_id)
//       )
//     )
//     .innerJoin(show, and(eq(showPlatformMc.show_id, show.id)))
//     .innerJoin(brand, and(eq(show.brand_id, brand.id)))
//     .innerJoin(mc, and(eq(showPlatformMc.mc_id, mc.id)))
//     .innerJoin(user, and(eq(mc.user_id, user.id)))
//     .innerJoin(platform, and(eq(showPlatformMc.platform_id, platform.id),))
//     .leftJoin(studioRoom, and(eq(showPlatform.studio_room_id, studioRoom.id)))
//     .where(
//       and(
//         or(eq(user.ext_uid, userId), eq(user.uid, userId)),
//         isNull(brand.deleted_at),
//         isNull(mc.deleted_at),
//         isNull(platform.deleted_at),
//         isNull(show.deleted_at),
//         isNull(showPlatform.deleted_at),
//         isNull(studioRoom.deleted_at),
//         isNull(user.deleted_at),
//         eq(show.uid, show_uid)
//       )
//     );

//   if (!showDetails) {
//     return c.json({ message: 'show not found' }, HttpStatusCodes.NOT_FOUND);
//   }

//   const data = showDetailsSerializer(showDetails);

//   return c.json(data, HttpStatusCodes.OK);
// };

// export const getMaterials: AppRouteHandler<GetMaterialsRoute> = async (c) => {
//   const { id: show_uid } = c.req.valid("param");
//   const userId = c.get('jwtPayload')!.id;

//   const materials = await db
//     .select({
//       ...getTableColumns(brandMaterial),
//       brand_uid: brand.uid,
//     })
//     .from(showPlatformMc)
//     .innerJoin(show, and(eq(showPlatformMc.show_id, show.id)))
//     .innerJoin(mc, and(eq(showPlatformMc.mc_id, mc.id)))
//     .innerJoin(user, and(eq(mc.user_id, user.id)))
//     .leftJoin(showPlatformMaterial, and(
//       eq(showPlatformMc.show_id, showPlatformMaterial.show_id),
//       eq(showPlatformMc.platform_id, showPlatformMaterial.platform_id),
//     ))
//     .leftJoin(brandMaterial, and(eq(showPlatformMaterial.brand_material_id, brandMaterial.id)))
//     .leftJoin(brand, and(eq(brandMaterial.brand_id, brand.id)))
//     .where(
//       and(
//         or(eq(user.ext_uid, userId), eq(user.uid, userId)),
//         eq(show.uid, show_uid),
//         isNull(showPlatformMc.deleted_at),
//         isNull(show.deleted_at),
//         isNull(mc.deleted_at),
//         isNull(user.deleted_at),
//         isNull(showPlatformMaterial.deleted_at),
//         isNull(brandMaterial.deleted_at),
//         isNull(brand.deleted_at),
//       )
//     );

//   const data = materials.map(showMaterialSerializer);

//   return c.json({ materials: data }, HttpStatusCodes.OK);
// };
