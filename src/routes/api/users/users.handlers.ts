import type { AppRouteHandler } from "@/lib/types";
import type { VerifyRoute } from "./users.routes";

import * as HttpStatusCodes from "@/http-status-codes";
import db from "@/db";
import { and, eq, getTableColumns, isNull } from "drizzle-orm";
import { user } from "@/db/schema";

export const verify: AppRouteHandler<VerifyRoute> = async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload?.id;

  if (!userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const foundUser = await db
    .select({ ...getTableColumns(user) })
    .from(user)
    .where(and(eq(user.uid, userId), isNull(user.deleted_at)));

  if (foundUser) {
    return c.json(null, HttpStatusCodes.OK);
  }

  await db
    .insert(user)
    .values({
      name: payload.name,
      email: payload.email,
      clerk_uid: payload.id,
    });

  return c.json(null, HttpStatusCodes.CREATED);
};