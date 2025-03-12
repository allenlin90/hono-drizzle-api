import { relations } from "drizzle-orm";

import { address } from "./address.schema";
import { brand } from "./brand.schema";
import { city } from "./city.schema";
import { mc } from "./mc.schema";
import { show } from "./show.schema";
import { studio } from "./studio.schema";
import { studioRoom } from "./studio-room.schema";
import { user } from "./user.schema";

export const addressRelation = relations(address, ({ one }) => ({
  city: one(city, {
    fields: [address.cityId],
    references: [city.id],
  }),
}));

export const brandRelation = relations(brand, ({ many }) => ({
  shows: many(show),
}));

export const cityRelation = relations(city, ({ many }) => ({
  addresses: many(address),
}));

export const mcRelation = relations(mc, ({ one }) => ({
  user: one(user, {
    fields: [mc.userId],
    references: [user.id],
  }),
}));

export const showRelation = relations(show, ({ one }) => ({
  brand: one(brand, {
    fields: [show.brandId],
    references: [brand.id],
  }),
  studioRoom: one(studioRoom, {
    fields: [show.studioRoomId],
    references: [studioRoom.id],
  }),
}));

export const studioRelation = relations(studio, ({ one, many }) => ({
  rooms: many(studioRoom),
  address: one(address, {
    fields: [studio.addressId],
    references: [address.id],
  }),
}));

export const studioRoomRelation = relations(studioRoom, ({ one, many }) => ({
  studio: one(studio, {
    fields: [studioRoom.studioId],
    references: [studio.id],
  }),
  shows: many(show),
}));

export const userRelation = relations(user, ({ one }) => ({
  mc: one(mc, {
    fields: [user.id],
    references: [mc.userId],
  }),
}));
