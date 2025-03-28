import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/columns.helpers";
import { showPlatform } from "./show-platform.schema";
import { brandMaterial } from "./brand-material.schema";

export const showPlatformMaterial = table(
  "show_platform_material",
  {
    show_id: t
      .integer("show_id")
      // .references(() => showPlatform.show_id)
      .notNull(),
    platform_id: t
      .integer("platform_id")
      // .references(() => showPlatform.platform_id)
      .notNull(),
    brand_material_id: t
      .integer("brand_material_id")
      .references(() => brandMaterial.id)
      .notNull(),
    ...timestamps,
  },
  (table) => [
    t.primaryKey({
      columns: [table.show_id, table.platform_id, table.brand_material_id],
    }),
    t.foreignKey({
      columns: [table.show_id, table.platform_id],
      foreignColumns: [showPlatform.show_id, showPlatform.platform_id],
    }),
    t.index("show_platform_material_show_id_idx").on(table.show_id),
    t.index("show_platform_material_platform_idx").on(table.platform_id),
    t
      .index("show_platform_material_brand_material_id_idx")
      .on(table.brand_material_id),
  ]
);
