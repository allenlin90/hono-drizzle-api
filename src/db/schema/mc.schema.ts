import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { user } from "./user.schema";

export const mc = table(
  "mc",
  {
    id: t.serial("id").primaryKey(),
    uid: brandedUid(PREFIX.MC),
    name: t.varchar("name", { length: 255 }),
    userId: t
      .integer("user_id")
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [t.index("mc_name_idx").on(table.name)]
);
