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
import { mc } from "@/db/schema";
import { mcSerializer } from "@/serializers/admin/mc.serializer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, id, banned, name, email, ext_id, ranking } = c.req.valid("query");

  const ilikeById = id ? eq(mc.uid, id) : undefined;
  const ilikeByBanned = banned ? eq(mc.banned, banned) : undefined;
  const ilikeByName = name ? ilike(mc.name, `%${name}%`) : undefined;
  const ilikeByEmail = email ? ilike(mc.email, `%${email}%`) : undefined;
  const ilikeByExtId = ext_id ? ilike(mc.ext_id, `%${ext_id}%`) : undefined;
  const ilikeByRanking = ranking ? ilike(mc.ranking, `%${ranking}%`) : undefined;

  const activeMcs = isNull(mc.deleted_at);
  const filters = and(
    activeMcs,
    ilikeById,
    ilikeByBanned,
    ilikeByName,
    ilikeByEmail,
    ilikeByExtId,
    ilikeByRanking
  );

  const mcs = await db
    .select({
      ...getTableColumns(mc),
    })
    .from(mc)
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(mc.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(mc)
    .where(filters);

  const data = mcs.map((row) => mcSerializer({ ...row, metadata: row.metadata as any }));

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

  try {
    const [inserted] = await db
      .insert(mc)
      .values({
        ...payload,
      })
      .returning();

    return c.json(
      mcSerializer({ ...inserted, metadata: inserted.metadata as any }),
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
    })
    .from(mc)
    .where(and(eq(mc.uid, id), isNull(mc.deleted_at)))
    .limit(1);

  if (!mcData) {
    return c.json(
      {
        message: "Mc not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(mcSerializer({ ...mcData, metadata: mcData.metadata as any }), HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id: mc_uid } = c.req.valid("param");
  const payload = c.req.valid("json");

  const [updated] = await db
    .update(mc)
    .set({
      ...payload,
    })
    .where(and(eq(mc.uid, mc_uid), isNull(mc.deleted_at)))
    .returning({
      ...getTableColumns(mc),
    });

  if (!updated) {
    return c.json(
      {
        message: "Mc not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(mcSerializer({ ...updated, metadata: updated.metadata as any }), HttpStatusCodes.OK);
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
