import type { AppRouteHandler } from "@/lib/types";
import type { ListRoute } from "./shows.routes";
import { count } from "drizzle-orm";
import db from "@/db";
import { show } from "@/db/schema";
import { showSerializer } from "@/serializers/show.serailizer";
import * as HttpStatusCodes from "@/http-status-codes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { offset, limit } = c.req.valid("query");

  const shows = await db.query.show.findMany({
    limit,
    offset,
    orderBy: (show, { asc }) => asc(show.id),
    where: (fields, operators) => operators.isNull(fields.deletedAt),
    with: {
      brand: {
        columns: {
          uid: true,
        },
      },
    },
  });
  const [{ count: total }] = await db.select({ count: count() }).from(show);

  const data = shows.map(showSerializer);

  return c.json(
    {
      object: "show",
      data,
      limit,
      offset,
      total,
    },
    HttpStatusCodes.OK
  );
};
