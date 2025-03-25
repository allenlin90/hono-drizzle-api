import { and, eq, getTableColumns, isNull } from "drizzle-orm";

import { PREFIX } from "@/constants";
import db from "@/db";
import {
  brand,
  platform,
  show,
  showPlatform,
  studio,
  studioRoom,
} from "@/db/schema";

export type EntityTypes = "show" | "show_platform" | "platform" | "studio_room";

export type ParamUidTypes =
  | "platform_uid"
  | "show_platform_uid"
  | "show_uid"
  | "studio_room_uid";

export type Tables =
  | typeof platform
  | typeof show
  | typeof showPlatform
  | typeof studioRoom;

type TableSelect<T extends Tables> = T["$inferSelect"];

export type ReturningObjectType<T extends EntityTypes> = Awaited<
  ReturnType<(typeof idValidators)[T]["queryObject"]>
>;

/* queryObject depending on the entity type will join associated tables
 * e.g. showPlatformQuery joins show, platform, and studioRoom tables
 */
export type TableType<T extends Tables> = {
  param: ParamUidTypes;
  table: T;
  prefix: PREFIX;
  queryObject:
    | typeof showPlatformQuery
    | typeof showQuery
    | typeof studioRoomQuery
    | ((uid: string) => Promise<TableSelect<T>[]>);
};

const queryObject = (table: Tables) => (uid: string) =>
  db
    .select()
    .from(table as Tables)
    .where(and(eq(table.uid, uid), isNull(table.deleted_at)))
    .limit(1);

const showPlatformQuery = (show_platform_uid: string) =>
  db
    .select({
      ...getTableColumns(showPlatform),
      show_uid: show.uid,
      platform_uid: platform.uid,
      studio_room_uid: studioRoom.uid,
    })
    .from(showPlatform)
    .innerJoin(show, eq(showPlatform.show_id, show.id))
    .innerJoin(platform, eq(showPlatform.platform_id, platform.id))
    .innerJoin(studioRoom, eq(showPlatform.studio_room_id, studioRoom.id))
    .where(
      and(
        eq(showPlatform.uid, show_platform_uid),
        isNull(showPlatform.deleted_at)
      )
    )
    .limit(1);

const showQuery = (show_uid: string) =>
  db
    .select({
      ...getTableColumns(show),
      brand_uid: brand.uid,
    })
    .from(show)
    .innerJoin(brand, eq(show.brand_id, brand.id))
    .where(and(eq(show.uid, show_uid), isNull(show.deleted_at)))
    .limit(1);

const studioRoomQuery = (studio_room_uid: string) =>
  db
    .select({
      ...getTableColumns(studioRoom),
      studio_uid: studio.uid,
    })
    .from(studioRoom)
    .innerJoin(studio, eq(studioRoom.studio_id, studio.id))
    .where(
      and(eq(studioRoom.uid, studio_room_uid), isNull(studioRoom.deleted_at))
    )
    .limit(1);

export const idValidators = {
  platform: {
    param: "platform_uid",
    table: platform,
    prefix: PREFIX.PLATFORM,
    queryObject: queryObject(platform),
  },
  show_platform: {
    param: "show_platform_uid",
    table: showPlatform,
    prefix: PREFIX.SHOW_PLATFORM,
    queryObject: showPlatformQuery,
  },
  show: {
    param: "show_uid",
    table: show,
    prefix: PREFIX.SHOW,
    queryObject: showQuery,
  },
  studio_room: {
    param: "studio_room_uid",
    table: studioRoom,
    prefix: PREFIX.STUDIO_ROOM,
    queryObject: studioRoomQuery,
  },
};
