import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./studios.routes";
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
import { address, studio } from "@/db/schema";
import { studioSerializer } from "@/serializers/studio.serializer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, name, address_id } = c.req.valid("query");

  const ilikeByName = name ? ilike(studio.name, `%${name}%`) : undefined;
  const ilikeByAddressUid = address_id
    ? ilike(address.uid, `%${address_id}%`)
    : undefined;
  const activeStudios = isNull(studio.deleted_at);
  const filters = and(ilikeByName, ilikeByAddressUid, activeStudios);

  const studios = await db
    .select({
      ...getTableColumns(studio),
      address_uid: address.uid,
    })
    .from(studio)
    .leftJoin(
      address,
      and(eq(studio.address_id, address.id), isNull(address.deleted_at))
    )
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(studio.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(studio)
    .leftJoin(
      address,
      and(eq(studio.address_id, address.id), isNull(address.deleted_at))
    )
    .where(filters);

  const data = studios.map(studioSerializer);

  return c.json(
    {
      object: "studio",
      data,
      limit,
      offset,
      total,
    },
    { status: HttpStatusCodes.OK }
  );
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const payload = c.req.valid("json");

  const [selectAddress] = await db
    .select({ id: address.id })
    .from(address)
    .where(
      and(eq(address.uid, payload.address_uid), isNull(address.deleted_at))
    )
    .limit(1);

  if (!selectAddress) {
    return c.json(
      {
        message: "Address not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const [inserted] = await db
    .insert(studio)
    .values({
      ...payload,
      address_id: selectAddress.id,
    })
    .returning();

  const data = studioSerializer({
    ...inserted,
    address_uid: payload.address_uid,
  });

  return c.json(data, HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const [studioData] = await db
    .select({
      ...getTableColumns(studio),
      address_uid: address.uid,
    })
    .from(studio)
    .leftJoin(
      address,
      and(eq(studio.address_id, address.id), isNull(address.deleted_at))
    )
    .where(and(eq(studio.uid, id), isNull(address.deleted_at)))
    .limit(1);

  if (!studioData) {
    return c.json(
      {
        message: "Studio not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = studioSerializer(studioData);

  return c.json(data, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id: studio_id } = c.req.valid("param");
  const payload = c.req.valid("json");

  let selectAddress: { id: number } | null = null;
  let byAddressUid = payload.address_uid
    ? eq(address.uid, payload.address_uid)
    : undefined;

  if (payload.address_uid) {
    const result = await db
      .select({ id: address.id })
      .from(address)
      .where(
        and(eq(address.uid, payload.address_uid), isNull(address.deleted_at))
      )
      .limit(1);

    selectAddress = result[0];

    if (!selectAddress) {
      return c.json(
        {
          message: "Address not found",
        },
        HttpStatusCodes.NOT_FOUND
      );
    }
  }

  const [updated] = await db
    .update(studio)
    .set({
      ...payload,
      ...(selectAddress && { address_id: selectAddress?.id }),
    })
    .from(address)
    .where(
      and(eq(studio.uid, studio_id), byAddressUid, isNull(address.deleted_at))
    )
    .returning({
      ...getTableColumns(studio),
      address_uid: address.uid,
    });

  if (!updated) {
    return c.json(
      {
        message: "Address not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = studioSerializer(updated);

  return c.json(data, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: studio_id } = c.req.valid("param");

  const result = await db
    .update(studio)
    .set({ deleted_at: new Date().toISOString() })
    .where(and(eq(studio.uid, studio_id), isNull(studio.deleted_at)))
    .returning();

  if (!result.length) {
    return c.json(
      {
        message: "Address not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
