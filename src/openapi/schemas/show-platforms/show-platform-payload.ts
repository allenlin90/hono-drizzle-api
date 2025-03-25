import { z } from "@hono/zod-openapi";
import { union } from "drizzle-orm/pg-core";
import { and, eq, isNull, sql } from "drizzle-orm";

import db from "@/db";
import {
  insertShowPlatformSchema,
  patchShowPlatformSchema,
  type PatchShowPlatformSchema,
} from "@/db/schema/show-platform.schema";
import {
  idValidators,
  type EntityTypes,
  type ParamUidTypes,
} from "../helpers/uid-validators";

type KeyTypes = Extract<EntityTypes, "platform" | "show" | "studio_room">;
type FilteredParams = Extract<
  ParamUidTypes,
  "platform_uid" | "show_uid" | "studio_room_uid"
>;

const uidValidator = async (
  { is_active = false, ...value }: PatchShowPlatformSchema,
  ctx: z.RefinementCtx
): Promise<ShowPlatformPayload> => {
  const keys = Object.entries(value)
    .filter(([_k, value]) => !!value)
    .map(([key]) => key.split("_").slice(0, -1).join("_") as KeyTypes);

  if (!keys.length) {
    return { params: value, is_active };
  }

  const queries = keys.map((type) => {
    const { table, ...validators } = idValidators[type];

    const param = validators.param as FilteredParams;

    return db
      .select({
        object: sql<KeyTypes>`${type}`,
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
    store[result.object] = result;
    return store;
  }, {} as Omit<ShowPlatformPayload, "is_active">);

  return { ...store, params: value, is_active };
};

export const createShowPlatformPayloadSchema =
  insertShowPlatformSchema.transform<ShowPlatformPayload>(uidValidator);

export const updateShowPlatformPayloadSchema =
  patchShowPlatformSchema.transform<ShowPlatformPayload>(uidValidator);

export interface ShowPlatformPayload {
  params: Omit<PatchShowPlatformSchema, "is_active">;
  platform?: { id: number; uid: string };
  show?: { id: number; uid: string };
  studio_room?: { id: number; uid: string };
  is_active: boolean | undefined;
}
