import { relations } from "drizzle-orm";

import { address } from "./address.schema";
import { city } from "./city.schema";
import { mc } from "./mc.schema";
import { studio } from "./studio.schema";
import { studioRoom } from "./studio-room.schema";
import { user } from "./user.schema";

export const cityRelation = relations(city, ({ many }) => ({
  addresses: many(address),
}));

export const addressRelation = relations(address, ({ one }) => ({
  city: one(city, {
    fields: [address.cityId],
    references: [city.id],
  }),
}));

export const studioRoomRelation = relations(studioRoom, ({ one }) => ({
  studio: one(studio, {
    fields: [studioRoom.studioId],
    references: [studio.id],
  }),
}));

export const studioRelation = relations(studio, ({ many }) => ({
  rooms: many(studioRoom),
}));

export const userRelation = relations(user, ({ one }) => ({
  mc: one(mc, {
    fields: [user.id],
    references: [mc.userId],
  }),
}));

export const mcRelation = relations(mc, ({ one }) => ({
  mc: one(user, {
    fields: [mc.userId],
    references: [user.id],
  }),
}));
