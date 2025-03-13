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
import { showMaterial } from "./show-material.schema";
import { showPlatformMaterial } from "./show-platform-material.schema";

export const addressRelation = relations(address, ({ one }) => ({
  city: one(city, {
    fields: [address.cityId],
    references: [city.id],
  }),
}));

export const brandRelation = relations(brand, ({ many }) => ({
  materials: many(showMaterial),
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

export const showMaterialRelation = relations(
  showMaterial,
  ({ one, many }) => ({
    brand: one(brand, {
      fields: [showMaterial.brandId],
      references: [brand.id],
    }),
    showPlatformMaterials: many(showPlatformMaterial),
  })
);

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
    showPlatformMaterials: many(showPlatformMaterial),
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

export const showPlatformMaterialRelation = relations(
  showPlatformMaterial,
  ({ one }) => ({
    showPlatform: one(showPlatform, {
      fields: [showPlatformMaterial.showPlatformId],
      references: [showPlatform.id],
    }),
    material: one(showMaterial, {
      fields: [showPlatformMaterial.showMaterialId],
      references: [showMaterial.id],
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
