import { relations } from "drizzle-orm";

import { address } from "./address.schema";
import { brand } from "./brand.schema";
import { city } from "./city.schema";
import { mc } from "./mc.schema";
import { show } from "./show.schema";
import { studio } from "./studio.schema";
import { studioRoom } from "./studio-room.schema";
import { user } from "./user.schema";
import { showPlatform } from "./show-platform";
import { platform } from "./platform.schema";
import { showPlatformMc } from "./show-platform-mc.schema";

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

export const mcRelation = relations(mc, ({ one, many }) => ({
  showPlatformMcs: many(showPlatformMc),
  user: one(user, {
    fields: [mc.userId],
    references: [user.id],
  }),
}));

export const platformRelation = relations(platform, ({ many }) => ({
  showPlatforms: many(showPlatform),
}));

export const showRelation = relations(show, ({ one, many }) => ({
  brand: one(brand, {
    fields: [show.brandId],
    references: [brand.id],
  }),
  showPlatforms: many(showPlatform),
}));

export const showPlatformRelation = relations(
  showPlatform,
  ({ one, many }) => ({
    show: one(show, {
      fields: [showPlatform.showId],
      references: [show.id],
    }),
    platform: one(platform, {
      fields: [showPlatform.platformId],
      references: [platform.id],
    }),
    studioRoom: one(studioRoom, {
      fields: [showPlatform.studioRoomId],
      references: [studioRoom.id],
    }),
    showPlatformMcs: many(showPlatformMc),
  })
);

export const showPlatformMcRelation = relations(showPlatformMc, ({ one }) => ({
  showPlatform: one(showPlatform, {
    fields: [showPlatformMc.showPlatformId],
    references: [showPlatform.id],
  }),
  mc: one(mc, {
    fields: [showPlatformMc.mcId],
    references: [mc.id],
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
  showPlatforms: many(showPlatform),
}));

export const userRelation = relations(user, ({ one }) => ({
  mc: one(mc, {
    fields: [user.id],
    references: [mc.userId],
  }),
}));
