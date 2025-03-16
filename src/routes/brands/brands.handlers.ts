import type { AppRouteHandler } from "@/lib/types";
import type { ListRoute } from "./brands.routes";
import db from "@/db";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const brands = await db.query.brand.findMany();

  return c.json(brands);
};
