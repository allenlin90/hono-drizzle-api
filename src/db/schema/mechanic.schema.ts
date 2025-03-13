import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/columns.helpers";
import { brand } from "./brand.schema";

export const mechanic = table(
  "mechanic",
  {
    id: t.serial("id").primaryKey(),
    brandId: t
      .integer("brand_id")
      .references(() => brand.id)
      .notNull(),
    name: t.varchar("name").notNull(),
    description: t.text("description"),
    resourceUrl: t.varchar("resource_url"),
    ...timestamps,
  },
  (table) => [t.unique().on(table.brandId, table.name)]
);
