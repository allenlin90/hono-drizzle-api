import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

import { city } from "./city.schema";

export const address = table("address", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: brandedUid(PREFIX.ADDRESS),
  address: t.varchar("address").notNull(),
  sub_district: t.varchar("sub_district", { length: 255 }),
  district: t.varchar("district", { length: 255 }),
  city_id: t
    .integer("city_id")
    .references(() => city.id)
    .notNull(),
  province: t.varchar("province", { length: 255 }).notNull(),
  postcode: t.varchar("postcode", { length: 16 }).notNull(),
  ...timestamps,
});
