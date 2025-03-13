import { relations } from "drizzle-orm";

import { address } from "./address.schema";
import { brand } from "./brand.schema";
import { city } from "./city.schema";
import { mc } from "./mc.schema";
import { show } from "./show.schema";
import { studio } from "./studio.schema";
import { studioRoom } from "./studio-room.schema";
import { user } from "./user.schema";
import { showPlatform } from "./show-platform.schema";
import { platform } from "./platform.schema";
import { showPlatformMc } from "./show-platform-mc.schema";
import { userRole } from "./user-role.schema";
import { role } from "./role.schema";
import { mechanic } from "./mechanic.schema";
import { showPlatformMechanic } from "./show-platform-mechanic.schema";

export const addressRelation = relations(address, ({ one }) => ({
  city: one(city, {
    fields: [address.cityId],
    references: [city.id],
  }),
}));

export const brandRelation = relations(brand, ({ many }) => ({
  mechanics: many(mechanic),
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

export const mechanicRelation = relations(mechanic, ({ one, many }) => ({
  brand: one(brand, {
    fields: [mechanic.brandId],
    references: [brand.id],
  }),
  showPlatformMechanics: many(showPlatformMechanic),
}));

export const platformRelation = relations(platform, ({ many }) => ({
  showPlatforms: many(showPlatform),
}));

export const roleRelation = relations(role, ({ many }) => ({
  userRoles: many(userRole),
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
    showPlatformMechanics: many(showPlatformMechanic),
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

export const showPlatformMechanicRelation = relations(
  showPlatformMechanic,
  ({ one }) => ({
    showPlatform: one(showPlatform, {
      fields: [showPlatformMechanic.showPlatformId],
      references: [showPlatform.id],
    }),
    mechanic: one(mechanic, {
      fields: [showPlatformMechanic.mechanicId],
      references: [mechanic.id],
    }),
  })
);

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

export const userRelation = relations(user, ({ one, many }) => ({
  mc: one(mc, {
    fields: [user.id],
    references: [mc.userId],
  }),
  userRoles: many(userRole),
}));

export const userRoleRelation = relations(userRole, ({ one }) => ({
  user: one(user, {
    fields: [userRole.userId],
    references: [user.id],
  }),
  role: one(role, {
    fields: [userRole.roleId],
    references: [role.id],
  }),
}));
