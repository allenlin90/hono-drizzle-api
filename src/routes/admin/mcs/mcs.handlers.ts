import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./mcs.routes";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  isNull,
} from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import { mc, user } from "@/db/schema";
import { mcSerializer } from "@/serializers/admin/mc.serializer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, name, user_id } = c.req.valid("query");

  const ilikeByName = name ? ilike(mc.name, `%${name}%`) : undefined;
  const userUid = user_id ? eq(user.uid, user_id) : undefined;
  const activeUsers = isNull(user.deleted_at);
  const activeMcs = isNull(mc.deleted_at);
  const filters = and(activeMcs, activeUsers, ilikeByName, userUid);

  const mcs = await db
    .select({
      ...getTableColumns(mc),
      user_uid: user.uid,
    })
    .from(mc)
    .leftJoin(user, and(eq(mc.user_id, user.id), isNull(user.deleted_at)))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(mc.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(mc)
    .leftJoin(user, and(eq(mc.user_id, user.id), isNull(user.deleted_at)))
    .where(filters);

  const data = mcs.map(mcSerializer);

  return c.json(
    {
      object: "mc",
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

  let selectUser: { id: number; } | null = null;

  try {
    if (payload.user_uid) {
      const queryResult = await db
        .select({ id: user.id })
        .from(user)
        .where(and(eq(user.uid, payload.user_uid), isNull(user.deleted_at)))
        .limit(1);

      selectUser = queryResult[0];

      if (!selectUser) {
        return c.json(
          {
            message: "User not found",
          },
          HttpStatusCodes.NOT_FOUND
        );
      }
    }

    const [inserted] = await db
      .insert(mc)
      .values({
        ...payload,
        user_id: selectUser?.id,
      })
      .returning();

    return c.json(
      mcSerializer({ ...inserted, user_uid: payload.user_uid }),
      HttpStatusCodes.CREATED
    );
  } catch (error: any) {
    if (error.code === "23505") {
      return c.json(
        {
          message: "duplicate on properties",
        },
        HttpStatusCodes.CONFLICT
      );
    }

    throw error;
  }
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const [mcData] = await db
    .select({
      ...getTableColumns(mc),
      user_uid: user.uid,
    })
    .from(mc)
    .leftJoin(user, eq(mc.user_id, user.id))
    .where(and(eq(mc.uid, id), isNull(user.deleted_at), isNull(mc.deleted_at)))
    .limit(1);

  if (!mcData) {
    return c.json(
      {
        message: "Mc not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(mcSerializer(mcData), HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id: mc_uid } = c.req.valid("param");
  const payload = c.req.valid("json");

  let selectUser: { id: number; } | null = null;
  let byUserUid = payload.user_uid ? eq(user.uid, payload.user_uid) : undefined;

  if (payload.user_uid) {
    const result = await db
      .select({ id: user.id })
      .from(user)
      .where(and(byUserUid, isNull(user.deleted_at)))
      .limit(1);

    selectUser = result[0];

    if (!selectUser) {
      return c.json(
        {
          message: "User not found",
        },
        HttpStatusCodes.NOT_FOUND
      );
    }
  }

  const [updated] = await db
    .update(mc)
    .set({
      ...payload,
      ...(selectUser && { user_id: selectUser?.id }),
    })
    .from(user)
    .where(and(eq(mc.uid, mc_uid), byUserUid, isNull(mc.deleted_at)))
    .returning({
      ...getTableColumns(mc),
      user_uid: user.uid,
    });

  if (!updated) {
    return c.json(
      {
        message: "Mc not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(mcSerializer(updated), HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: mc_uid } = c.req.valid("param");

  // TODO: remove associated data, e.g. show_platform
  const result = await db
    .update(mc)
    .set({ deleted_at: new Date().toISOString() })
    .where(and(eq(mc.uid, mc_uid), isNull(mc.deleted_at)))
    .returning();

  if (!result.length) {
    return c.json(
      {
        message: "Mc not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
