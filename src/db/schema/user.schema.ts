import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { generateRandomString } from "@/utils/generate-random-string";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

export const user = table(
  "users",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: brandedUid(PREFIX.USER),
    clerk_uid: t.varchar("clerk_uid", { length: 255 }).unique(),
    email: t.varchar("email", { length: 255 }).unique().notNull(),
    // TODO: proper hash and salt after changing auth module
    password: t // no use
      .varchar("password", { length: 255 })
      .$default(() => generateRandomString(32))
      .notNull(),
    name: t.varchar("name", { length: 255 }).notNull(),
    ...timestamps,
  },
  (table) => {
    return [t.index("user_name_idx").on(table.name)];
  }
);
