import type { AppRouteHandler } from "@/lib/types";
import type { ListRoute } from "./brands.routes";

export const list: AppRouteHandler<ListRoute> = (c) => {
  // TODO: query from db
  return c.json([
    {
      id: 1,
      uid: "brand-1",
      name: "Brand 1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);
};
