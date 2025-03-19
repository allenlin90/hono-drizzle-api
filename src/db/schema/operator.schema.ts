import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { user } from "./user.schema";

export const operator = table(
  "operator",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.OPERATOR),
    name: t.varchar("name").notNull(),
    user_id: t.integer("user_id").references(() => user.id),
    ...timestamps,
  },
  (table) => [t.index("operator_name_idx").on(table.name)]
);
