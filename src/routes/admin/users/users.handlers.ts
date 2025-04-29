import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./users.routes";
import { and, asc, eq, getTableColumns, ilike, isNull } from "drizzle-orm";
import db from "@/db";
import { user } from "@/db/schema";
import * as HttpStatusCodes from "@/http-status-codes";
import * as HttpStatusPhrases from "@/http-status-phrases";
import { userSerializer } from "@/serializers/admin/user.serializer";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit, email, name } = c.req.valid("query");
  const ilikeByName = name ? ilike(user.name, `%${name}%`) : undefined;
  const ilikeByEmail = email ? ilike(user.email, `%${email}%`) : undefined;
  const filters = and(isNull(user.deleted_at), ilikeByEmail, ilikeByName);

  const users = await db
    .select({ ...getTableColumns(user) })
    .from(user)
    .where(filters)
    .orderBy(asc(user.id))
    .limit(limit)
    .offset(offset);

  const total = await db.$count(user, filters);

  const data = users.map(userSerializer);

  return c.json(
    {
      object: "user",
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

  // TODO: retrieve clerk_uid from context
  const [inserted] = await db
    .insert(user)
    .values({ ...payload })
    .returning();

  return c.json(userSerializer(inserted), HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = await db.query.user.findFirst({
    where: (fields, operators) =>
      operators.and(
        operators.eq(fields.uid, id),
        operators.isNull(fields.deleted_at)
      ),
  });

  if (!user) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = userSerializer(user);

  return c.json(data, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");
  const [updated] = await db
    .update(user)
    .set({ ...updates, updated_at: new Date().toISOString() })
    .where(and(eq(user.uid, id), isNull(user.deleted_at)))
    .returning();

  if (!updated) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  const data = userSerializer(updated);

  return c.json(data, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const result = await db
    .update(user) // soft delete
    .set({ deleted_at: new Date().toISOString() })
    .where(and(eq(user.uid, id), isNull(user.deleted_at)))
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
