import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";
import { isNull } from "drizzle-orm";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";

import { city } from "./city.schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const address = table(
  "address",
  {
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
  },
  (table) => [
    t.index("address_idx").on(table.address).where(isNull(table.deleted_at)),
    t
      .index("address_sub_district_idx")
      .on(table.sub_district)
      .where(isNull(table.deleted_at)),
    t
      .index("address_district_idx")
      .on(table.district)
      .where(isNull(table.deleted_at)),
    t
      .index("address_city_id_idx")
      .on(table.city_id)
      .where(isNull(table.deleted_at)),
    t
      .index("address_province_idx")
      .on(table.province)
      .where(isNull(table.deleted_at)),
    t
      .index("address_postcode_idx")
      .on(table.postcode)
      .where(isNull(table.deleted_at)),
  ]
);

export const selectAddressSchema = createSelectSchema(address)
  .merge(
    z.object({
      city_uid: z.string().startsWith(PREFIX.CITY),
    })
  )
  .omit({
    id: true,
    city_id: true,
    deleted_at: true,
  });

export const insertAddressSchema = createInsertSchema(address)
  .merge(
    z.object({
      address: z.string().min(1),
      sub_district: z.string().min(1).optional(),
      district: z.string().min(1).optional(),
      city_uid: z.string().startsWith(PREFIX.CITY),
    })
  )
  .omit({
    uid: true,
    city_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export const patchAddressSchema = createUpdateSchema(address)
  .merge(
    z.object({
      city_uid: z.string().startsWith(PREFIX.CITY).optional(),
    })
  )
  .omit({
    uid: true,
    city_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
  });

export type SelectAddressSchema = z.infer<typeof selectAddressSchema>;
export type InsertAddressSchema = z.infer<typeof insertAddressSchema>;
export type PatchAddressSchema = z.infer<typeof patchAddressSchema>;
