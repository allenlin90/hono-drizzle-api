import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./addresses.routes";
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
import { address, city } from "@/db/schema";
import { addressSerializer } from "@/serializers/address.serializer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const {
    offset,
    limit,
    city_id,
    address: address_param,
    district,
    sub_district,
    postcode,
    province,
  } = c.req.valid("query");

  const ilikeByAddress = address_param
    ? ilike(address.address, `%${address_param}%`)
    : undefined;
  const ilikeByDistrict = district
    ? ilike(address.district, `%${district}%`)
    : undefined;
  const ilikeBySubDistrict = sub_district
    ? ilike(address.sub_district, `%${sub_district}%`)
    : undefined;
  const ilikeByPostcode = postcode
    ? ilike(address.postcode, `%${postcode}%`)
    : undefined;
  const ilikeByProvince = province
    ? ilike(address.province, `%${province}%`)
    : undefined;
  const cityUid = city_id ? eq(city.uid, city_id) : undefined;
  const activeAddresses = isNull(address.deleted_at);
  const filters = and(
    cityUid,
    ilikeByAddress,
    ilikeByDistrict,
    ilikeBySubDistrict,
    ilikeByPostcode,
    ilikeByProvince,
    activeAddresses
  );

  const addresses = await db
    .select({
      ...getTableColumns(address),
      city_uid: city.uid,
    })
    .from(address)
    .innerJoin(city, eq(address.city_id, city.id))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(address.created_at));

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(address)
    .innerJoin(city, eq(address.city_id, city.id))
    .where(filters);

  const data = addresses.map(addressSerializer);

  return c.json(
    {
      object: "address",
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

  const [selectCity] = await db
    .select({ id: city.id })
    .from(city)
    .where(and(eq(city.uid, payload.city_uid), isNull(city.deleted_at)))
    .limit(1);

  if (!selectCity) {
    return c.json(
      {
        message: "City not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const [inserted] = await db
    .insert(address)
    .values({
      ...payload,
      city_id: selectCity.id,
    })
    .returning();

  const data = addressSerializer({ ...inserted, city_uid: payload.city_uid });

  return c.json(data, HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const [addressData] = await db
    .select({
      ...getTableColumns(address),
      city_uid: city.uid,
    })
    .from(address)
    .innerJoin(city, eq(address.city_id, city.id))
    .where(and(eq(address.uid, id), isNull(city.deleted_at)))
    .limit(1);

  if (!addressData) {
    return c.json(
      {
        message: "Address not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = addressSerializer(addressData);

  return c.json(data, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id: address_id } = c.req.valid("param");
  const payload = c.req.valid("json");

  let selectCity: { id: number } | null = null;
  let byCityUid = payload.city_uid ? eq(city.uid, payload.city_uid) : undefined;

  if (payload.city_uid) {
    const result = await db
      .select({ id: city.id })
      .from(city)
      .where(and(eq(city.uid, payload.city_uid), isNull(city.deleted_at)))
      .limit(1);

    selectCity = result[0];

    if (!selectCity) {
      return c.json(
        {
          message: "City not found",
        },
        HttpStatusCodes.NOT_FOUND
      );
    }
  }

  const [updated] = await db
    .update(address)
    .set({
      ...payload,
      ...(selectCity && { city_id: selectCity?.id }),
    })
    .from(city)
    .where(
      and(eq(address.uid, address_id), byCityUid, isNull(address.deleted_at))
    )
    .returning({
      ...getTableColumns(address),
      city_uid: city.uid,
    });

  if (!updated) {
    return c.json(
      {
        message: "Address not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = addressSerializer(updated);

  return c.json(data, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: address_id } = c.req.valid("param");

  const result = await db
    .update(address)
    .set({ deleted_at: new Date().toISOString() })
    .where(and(eq(address.uid, address_id), isNull(address.deleted_at)))
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
