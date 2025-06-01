import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./clients.routes";
import { and, asc, eq, getTableColumns, ilike, isNotNull, isNull } from "drizzle-orm";
import db from "@/db";
import { client } from "@/db/schema";
import { clientSerializer } from "@/serializers/admin/client.serializer";
import { patchClientSchema } from "@/db/schema/client.schema";
import * as HttpStatusCodes from "@/http-status-codes";
import * as HttpStatusPhrases from "@/http-status-phrases";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, name } = c.req.valid("query");

  const ilikeByName = name ? ilike(client.name, `%${name}%`) : undefined;
  const filters = and(isNull(client.deleted_at), ilikeByName);

  const clients = await db
    .select({ ...getTableColumns(client) })
    .from(client)
    .where(filters)
    .orderBy(asc(client.id))
    .limit(limit)
    .offset(offset);

  const total = await db.$count(client, filters);

  const data = clients.map(clientSerializer);

  return c.json(
    {
      object: "client",
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

  const [inserted] = await db
    .insert(client)
    .values(payload)
    .onConflictDoUpdate(
      {
        target: [client.name],
        set: {
          ...payload,
          deleted_at: null,
        },
        setWhere: isNotNull(client.deleted_at),
      }
    )
    .returning();

  return c.json(clientSerializer(inserted), HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const clientObj = await db.query.client.findFirst({
    where: (fields, operators) =>
      operators.and(
        operators.eq(fields.uid, id),
        operators.isNull(fields.deleted_at)
      ),
  });

  if (!clientObj) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = clientSerializer(clientObj);

  return c.json(data, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const payload = c.req.valid("json");
  const updates = patchClientSchema.parse(payload);

  const [updated] = await db
    .update(client)
    .set({ ...updates, updated_at: new Date().toISOString() })
    .where(and(eq(client.uid, id), isNull(client.deleted_at)))
    .returning();

  if (!updated) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = clientSerializer(updated);

  return c.json(data, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  // TODO: remove associated data, e.g. shows, materials
  const result = await db
    .update(client) // soft delete
    .set({ deleted_at: new Date().toISOString() })
    .where(and(eq(client.uid, id), isNull(client.deleted_at)))
    .returning();

  if (!result.length) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
