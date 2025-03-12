import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { generateRandomString } from "../helpers/random-string.helpers";

export const user = table(
  "user",
  {
    id: t.serial("id").primaryKey(),
    uid: brandedUid(PREFIX.USER),
    clerkUid: t.varchar("clerk_uid", { length: 255 }).unique(),
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
    return [
      t.uniqueIndex("uid_idx").on(table.uid),
      t.uniqueIndex("email_idx").on(table.email),
      t.index("name_idx").on(table.name),
    ];
  }
);
