import { z } from "@hono/zod-openapi";
import { and, eq, getTableColumns, isNull, sql } from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import db from "@/db";
import {
  brand,
  mc,
  platform,
  show,
  showPlatform,
  studio,
  studioRoom,
} from "@/db/schema";

export type EntityTypes =
  | "mc"
  | "show"
  | "show_platform"
  | "platform"
  | "studio_room";

export type ParamUidTypes =
  | "mc_uid"
  | "platform_uid"
  | "show_platform_uid"
  | "show_uid"
  | "studio_room_uid";

export type Tables =
  | typeof mc
  | typeof platform
  | typeof show
  | typeof showPlatform
  | typeof studioRoom;

type FilteredParams = Extract<
  ParamUidTypes,
  "platform_uid" | "show_uid" | "studio_room_uid"
>;

type QueryResult = Partial<Record<EntityTypes, { id: number; uid: string }>>;

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

// const mcQuery = (mc_uid: string) =>
//   db
//     .select({ ...getTableColumns(mc) })
//     .from(mc)
//     .where(and(eq(mc.uid, mc_uid), isNull(mc.deleted_at)))
//     .limit(1);

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
    .leftJoin(studioRoom, eq(showPlatform.studio_room_id, studioRoom.id))
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
  mc: {
    param: "mc_uid",
    table: mc,
    prefix: PREFIX.MC,
    queryObject: queryObject(mc),
  },
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

export const uidValidator = async <
  T extends Partial<Record<ParamUidTypes, string | null | undefined>>,
  R extends {
    params: T;
  } & QueryResult
>(
  value: T,
  ctx: z.RefinementCtx
): Promise<R> => {
  const keys = Object.entries(value)
    .filter(([_k, value]) => !!value) // filter out required, nullable keys
    .map(([key]) => key.split("_").slice(0, -1).join("_") as EntityTypes);

  if (!keys.length) {
    return { params: value } as R;
  }

  const queries = keys.map((type) => {
    const { table, ...validators } = idValidators[type];

    const param = validators.param as FilteredParams;

    return db
      .select({
        object: sql<EntityTypes>`${type}`,
        id: table.id,
        uid: table.uid,
      })
      .from(table)
      .where(and(eq(table.uid, value[param]!), isNull(table.deleted_at)));
  });

  const queryResult = [] as Awaited<(typeof queries)[0]>;

  if (queries.length === 1) {
    queryResult.push(...(await queries[0]));
  } else {
    // @ts-ignore
    queryResult.push(...(await union(...queries)));
  }

  if (queryResult.length !== keys.length) {
    const objectTypes = queryResult.map(({ object }) => object);
    const entityNotFound = keys.filter((key) => !objectTypes.includes(key));

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${entityNotFound.join(", ")} not found`,
    });

    return z.NEVER;
  }

  const store = queryResult.reduce((store, result) => {
    const { object, ...ids } = result;
    store[object] = ids;
    return store;
  }, {} as Partial<QueryResult>);

  return { ...store, params: value } as R;
};
