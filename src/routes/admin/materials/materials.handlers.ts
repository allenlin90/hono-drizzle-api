import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./materials.routes";
import { and, count, eq, getTableColumns, ilike, isNull } from "drizzle-orm";
import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import { client, material } from "@/db/schema";
import { materialSerializer } from "@/serializers/admin/material.serializer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, client_id, name, type, is_active } =
    c.req.valid("query");

  const ilikeByName = name ? ilike(material.name, `%${name}%`) : undefined;
  const clientUid = client_id ? eq(client.uid, client_id) : undefined;
  const isActive =
    is_active !== undefined
      ? eq(material.is_active, is_active)
      : undefined;
  const materialType = type ? eq(material.type, type) : undefined;

  const filters = and(ilikeByName, clientUid, isActive, materialType);

  const materialsList = await db
    .select({
      ...getTableColumns(material),
      client_uid: client.uid,
    })
    .from(material)
    .innerJoin(client, eq(material.client_id, client.id))
    .where(filters)
    .limit(limit)
    .offset(offset)
    .orderBy(material.created_at);

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(material)
    .innerJoin(client, eq(material.client_id, client.id))
    .where(filters);

  const data = materialsList.map(materialSerializer);

  return c.json(
    {
      object: "material",
      data,
      limit,
      offset,
      total,
    },
    HttpStatusCodes.OK
  );
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const idempotencyKey = c.req.valid("header")["Idempotency-Key"];

  if (!idempotencyKey) {
    return c.json(
      {
        message: "idempotency key is required",
      },
      HttpStatusCodes.BAD_REQUEST
    );
  }

  const payload = c.req.valid("json");

  if (!payload.client_uid) {
    return c.json(
      {
        success: false,
        error: {
          name: "ValidationError",
          issues: [
            {
              path: ["client_uid"],
              code: "invalid_type",
              message: "client_uid is required",
            },
          ],
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const [selectClient] = await db
    .select({ id: client.id })
    .from(client)
    .where(and(eq(client.uid, payload.client_uid), isNull(client.deleted_at)))
    .limit(1);

  if (!selectClient) {
    return c.json(
      {
        message: "Client not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const [inserted] = await db
    .insert(material)
    .values({
      ...payload,
      client_id: selectClient.id,
    })
    .returning();

  return c.json(
    materialSerializer({ ...inserted, client_uid: payload.client_uid as string }),
    HttpStatusCodes.CREATED
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const [materialData] = await db
    .select({
      ...getTableColumns(material),
      client_uid: client.uid,
    })
    .from(material)
    .innerJoin(client, eq(material.client_id, client.id))
    .where(and(eq(material.uid, id), isNull(client.deleted_at)))
    .limit(1);

  if (!materialData) {
    return c.json(
      {
        message: "Material not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(materialSerializer(materialData), HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id: material_uid } = c.req.valid("param");
  const payload = c.req.valid("json");

  let selectClient: { id: number } | null = null;
  let byClientUid = payload.client_uid
    ? eq(client.uid, payload.client_uid)
    : undefined;

  if (payload.client_uid) {
    const result = await db
      .select({ id: client.id })
      .from(client)
      .where(and(byClientUid, isNull(client.deleted_at)))
      .limit(1);

    selectClient = result[0];

    if (!selectClient) {
      return c.json(
        {
          message: "Client not found",
        },
        HttpStatusCodes.NOT_FOUND
      );
    }
  }

  const [updated] = await db
    .update(material)
    .set({
      ...payload,
      ...(selectClient && { client_id: selectClient?.id }),
    })
    .from(client)
    .where(
      and(
        eq(material.uid, material_uid),
        byClientUid,
        isNull(material.deleted_at)
      )
    )
    .returning({
      ...getTableColumns(material),
      client_uid: client.uid,
    });

  if (!updated) {
    return c.json(
      {
        message: "Material not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(materialSerializer(updated), HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id: material_uid } = c.req.valid("param");

  // TODO: remove associated data, e.g. material_platform_material
  const result = await db
    .update(material)
    .set({ deleted_at: new Date().toISOString() })
    .where(
      and(eq(material.uid, material_uid), isNull(material.deleted_at))
    )
    .returning();

  if (!result.length) {
    return c.json(
      {
        message: "Material not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
