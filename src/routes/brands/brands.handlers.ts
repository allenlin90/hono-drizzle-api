import type { AppRouteHandler } from "@/lib/types";
import type { CreateRoute, GetOneRoute, ListRoute } from "./brands.routes";
import db from "@/db";
import { brand } from "@/db/schema";
import * as HttpStatusCodes from "@/http-status-codes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const brands = await db.query.brand.findMany();

  return c.json(brands);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const payload = c.req.valid("json");
  const [inserted] = await db.insert(brand).values(payload).returning();

  return c.json(inserted, HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const brand = await db.query.brand.findFirst({
    where: (fields, operators) => {
      return operators.eq(fields.uid, id);
    },
  });

  if (!brand) {
    return c.json(
      {
        message: "Brand not found",
      },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(brand, HttpStatusCodes.OK);
};
