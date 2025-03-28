import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { showPlatform } from "./show-platform.schema";
import { brandMaterial } from "./brand-material.schema";

export const showPlatformMaterial = table(
  "show_platform_material",
  {
    uid: brandedUid(PREFIX.SHOW_PLATFORM_MATERIAL),
    show_id: t.integer("show_id").notNull(),
    platform_id: t.integer("platform_id").notNull(),
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

export const selectShowPlatformMaterialSchema = createSelectSchema(
  showPlatformMaterial
)
  .merge(
    z.object({
      material_uid: z.string().startsWith(PREFIX.SHOW_PLATFORM_MATERIAL),
      show_uid: z.string().startsWith(PREFIX.SHOW),
      platform_uid: z.string().startsWith(PREFIX.PLATFORM),
    })
  )
  .omit({
    show_id: true,
    platform_id: true,
    brand_material_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });
