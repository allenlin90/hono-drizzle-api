import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { brand } from "./brand.schema";
import { PREFIX } from "@/constants";

export const materialTypeEnum = t.pgEnum("material_type", [
  "mechanic",
  "scene",
  "script",
  "other",
]);

export const brandMaterial = table(
  "brand_material",
  {
    id: t.serial("id").primaryKey(),
    uid: brandedUid(PREFIX.MATERIAL),
    brandId: t
      .integer("brand_id")
      .references(() => brand.id)
      .notNull(),
    type: materialTypeEnum().notNull(),
    name: t.varchar("name").notNull(),
    description: t.text("description"),
    isActive: t.boolean("is_active").default(true).notNull(),
    resourceUrl: t.varchar("resource_url"),
    ...timestamps,
  },
  (table) => [
    t.unique().on(table.brandId, table.name),
    t.index().on(table.name),
  ]
);
