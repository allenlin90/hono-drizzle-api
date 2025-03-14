import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/columns.helpers";
import { showPlatform } from "./show-platform.schema";
import { brandMaterial } from "./brand-material.schema";

export const showPlatformMaterial = table(
  "show_platform_material",
  {
    id: t.serial("id").primaryKey(),
    showPlatformId: t
      .integer("show_platform_id")
      .references(() => showPlatform.id)
      .notNull(),
    brandMaterialId: t
      .integer("show_material_id")
      .references(() => brandMaterial.id)
      .notNull(),
    ...timestamps,
  },
  (table) => [t.unique().on(table.showPlatformId, table.brandMaterialId)]
);
