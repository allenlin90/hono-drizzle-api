import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";

import { PREFIX } from "@/constants";
import { generateRandomString } from "@/utils/generate-random-string";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

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

export const selectUserSchema = createSelectSchema(user).omit({
  id: true,
  clerk_uid: true,
  password: true,
  deleted_at: true,
});

export const insertUserSchema = createInsertSchema(user, {
  name: z.string().min(1),
  email: z.string().email(),
}).omit({
  uid: true,
  clerk_uid: true,
  password: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// allow changing clerk_uid and password in a different update schema
export const patchUserSchema = createUpdateSchema(user, {
  name: z.string().min(1),
  email: z.string().email(),
}).omit({
  uid: true,
  clerk_uid: true,
  password: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export type SelectUserSchema = z.infer<typeof selectUserSchema>;
export type InsertUserSchema = z.infer<typeof insertUserSchema>;
export type PatchUserSchema = z.infer<typeof patchUserSchema>;
