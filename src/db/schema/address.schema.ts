import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

import { city } from "./city.schema";

export const address = table("address", {
  id: t.serial("id").primaryKey(),
  uid: brandedUid(PREFIX.ADDRESS),
  address: t.varchar("address", { length: 255 }).notNull(),
  subDistrict: t.varchar("sub_district", { length: 255 }),
  district: t.varchar("district", { length: 255 }),
  cityId: t
    .integer("city_id")
    .references(() => city.id, { onDelete: "set null" })
    .notNull(),
  province: t.varchar("province", { length: 255 }).notNull(),
  postcode: t.varchar("postcode", { length: 16 }).notNull(),
  ...timestamps,
});
