import { z } from "@hono/zod-openapi";
import { and, eq, getTableColumns, isNull, sql } from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import db from "@/db";
import {
  client,
  formTemplate,
  material,
  mc,
  member,
  platform,
  show,
  showPlatform,
  studio,
  studioRoom,
} from "@/db/schema";

export type EntityTypes =
  | "client"
  | "form_template"
  | "material"
  | "mc"
  | "member"
  | "platform"
  | "show_platform"
  | "show"
  | "studio_room"
  | "studio";

export type ParamUidTypes =
  | "client_uid"
  | "form_template_uid"
  | "material_uid"
  | "mc_uid"
  | "member_uid"
  | "platform_uid"
  | "show_platform_uid"
  | "show_uid"
  | "studio_room_uid"
  | "studio_uid";

export type Tables =
  | typeof client
  | typeof formTemplate
  | typeof material
  | typeof mc
  | typeof member
  | typeof platform
  | typeof showPlatform
  | typeof show
  | typeof studioRoom
  | typeof studio;

type QueryResult = Partial<Record<EntityTypes, { id?: number; uid: string; }>>;

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
  | typeof materialQuery
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

const materialQuery = (material_uid: string) =>
  db
    .select({
      ...getTableColumns(material),
      client: { ...getTableColumns(client) },
    })
    .from(material)
    .leftJoin(client, eq(material.client_id, client.id))
    .where(
      and(eq(material.uid, material_uid), isNull(material.deleted_at))
    )
    .limit(1);

const showPlatformQuery = (show_platform_uid: string) =>
  db
    .select({
      ...getTableColumns(showPlatform),
      show_uid: show.uid,
      platform_uid: platform.uid,
      reviewer_uid: member.uid,
      review_form_uid: formTemplate.uid,
    })
    .from(showPlatform)
    .innerJoin(show, eq(showPlatform.show_id, show.id))
    .innerJoin(platform, eq(showPlatform.platform_id, platform.id))
    .leftJoin(
      member,
      and(eq(showPlatform.reviewer_id, member.id), isNull(member.deleted_at))
    )
    .leftJoin(
      formTemplate,
      and(
        eq(showPlatform.review_form_id, formTemplate.id),
        isNull(formTemplate.deleted_at)
      )
    )
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
      client_uid: client.uid,
    })
    .from(show)
    .leftJoin(client, eq(show.client_id, client.id))
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
  client: {
    param: "client_uid",
    table: client,
    prefix: PREFIX.CLIENT,
    queryObject: queryObject(client),
  },
  form_template: {
    param: "form_template_uid",
    table: formTemplate,
    prefix: PREFIX.FORM_TEMPLATE,
    queryObject: queryObject(formTemplate),
  },
  material: {
    param: "material_uid",
    table: material,
    prefix: PREFIX.MATERIAL,
    queryObject: materialQuery,
  },
  mc: {
    param: "mc_uid",
    table: mc,
    prefix: PREFIX.MC,
    queryObject: queryObject(mc),
  },
  member: {
    param: "member_uid",
    table: member,
    prefix: PREFIX.MEMBER,
    queryObject: queryObject(member),
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
  studio: {
    param: "studio_uid",
    table: studio,
    prefix: PREFIX.STUDIO,
    queryObject: queryObject(studio),
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

    const param = validators.param as ParamUidTypes;

    return db
      .select({
        object: sql<EntityTypes>`${type}`,
        ...("id" in table && { id: table.id }),
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
