import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { address } from "./address.schema";

export const studio = table("studio", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: brandedUid(PREFIX.STUDIO),
  name: t.varchar("name").unique().notNull(),
  address_id: t.integer("address_id").references(() => address.id),
  ...timestamps,
});
