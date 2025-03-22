import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./operators.routes";
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
import { operator, user } from "@/db/schema";
import { operatorSerializer } from "@/serializers/operator.serializer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, name, user_id } = c.req.valid("query");

  const ilikeByName = name ? ilike(operator.name, `%${name}%`) : undefined;
  const userUid = user_id ? eq(user.uid, user_id) : undefined;
  const activeUsers = isNull(user.deleted_at);
  const activeMcs = isNull(operator.deleted_at);
  const filters = and(activeMcs, activeUsers, ilikeByName, userUid);

  const operators = await db
    .select({
      ...getTableColumns(operator),
      user_uid: user.uid,
    })
    .from(operator)
    .innerJoin(user, eq(operator.user_id, user.id))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(operator.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(operator)
    .innerJoin(user, eq(operator.user_id, user.id))
    .where(filters);

  const data = operators.map(operatorSerializer);

  return c.json(
    {
      object: "operator",
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

  const [selectUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.uid, payload.user_uid), isNull(user.deleted_at)))
    .limit(1);

  if (!selectUser) {
    return c.json(
      {
        message: "Brand not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const [inserted] = await db
    .insert(operator)
    .values({
      ...payload,
      user_id: selectUser.id,
    })
    .returning();

  return c.json(
    operatorSerializer({ ...inserted, user_uid: payload.user_uid }),
    HttpStatusCodes.CREATED
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const [operatorData] = await db
    .select({
      ...getTableColumns(operator),
      user_uid: user.uid,
    })
    .from(operator)
    .innerJoin(user, eq(operator.user_id, user.id))
    .where(
      and(
        eq(operator.uid, id),
        isNull(user.deleted_at),
        isNull(operator.deleted_at)
      )
    )
    .limit(1);

  if (!operatorData) {
    return c.json(
      {
        message: "Operator not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(operatorSerializer(operatorData), HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id: operator_uid } = c.req.valid("param");
  const payload = c.req.valid("json");

  let selectUser: { id: number } | null = null;
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
    .update(operator)
    .set({
      ...payload,
      ...(selectUser && { user_id: selectUser?.id }),
    })
    .from(user)
    .where(
      and(
        eq(operator.uid, operator_uid),
        byUserUid,
        isNull(operator.deleted_at)
      )
    )
    .returning({
      ...getTableColumns(operator),
      user_uid: user.uid,
    });

  if (!updated) {
    return c.json(
      {
        message: "Operator not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(operatorSerializer(updated), HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: operator_uid } = c.req.valid("param");

  // TODO: remove associated data, e.g. show_platform
  const result = await db
    .update(operator)
    .set({ deleted_at: new Date().toISOString() })
    .where(and(eq(operator.uid, operator_uid), isNull(operator.deleted_at)))
    .returning();

  if (!result.length) {
    return c.json(
      {
        message: "Operator not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
