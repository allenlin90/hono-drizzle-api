import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

export const platform = table("platform", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: brandedUid(PREFIX.PLATFORM),
  name: t.varchar("name").unique().notNull(),
  ...timestamps,
});

export const selectPlatformSchema = createSelectSchema(platform).omit({
  id: true,
  deleted_at: true,
});

export type SelectPlatformSchema = z.infer<typeof selectPlatformSchema>;
