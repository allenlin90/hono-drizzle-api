import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/columns.helpers";
import { showPlatform } from "./show-platform.schema";
import { brandMaterial } from "./brand-material.schema";

export const showPlatformMaterial = table(
  "show_platform_material",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    show_platform_id: t
      .integer("show_platform_id")
      .references(() => showPlatform.id)
      .notNull(),
    brand_material_id: t
      .integer("brand_material_id")
      .references(() => brandMaterial.id)
      .notNull(),
    ...timestamps,
  },
  (table) => [t.unique().on(table.show_platform_id, table.brand_material_id)]
);
