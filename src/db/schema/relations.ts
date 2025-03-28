import { relations } from "drizzle-orm";

import { address } from "./address.schema";
import { brandMaterial } from "./brand-material.schema";
import { brand } from "./brand.schema";
import { city } from "./city.schema";
import { mcShowReview } from "./mc-show-review.schema";
import { mc } from "./mc.schema";
import { operator } from "./operator.schema";
import { platform } from "./platform.schema";
import { showPlatformMaterial } from "./show-platform-material.schema";
import { showPlatformMc } from "./show-platform-mc.schema";
import { showPlatformReview } from "./show-platform-review.schema";
import { showPlatform } from "./show-platform.schema";
import { show } from "./show.schema";
import { studioRoom } from "./studio-room.schema";
import { studio } from "./studio.schema";
import { task } from "./task.schema";
import { user } from "./user.schema";

export const addressRelation = relations(address, ({ one }) => ({
  city: one(city, {
    fields: [address.city_id],
    references: [city.id],
  }),
}));

export const brandMaterialRelation = relations(
  brandMaterial,
  ({ one, many }) => ({
    brand: one(brand, {
      fields: [brandMaterial.brand_id],
      references: [brand.id],
    }),
    showPlatformMaterials: many(showPlatformMaterial),
  })
);

export const brandRelation = relations(brand, ({ many }) => ({
  materials: many(brandMaterial),
  shows: many(show),
}));

export const cityRelation = relations(city, ({ many }) => ({
  addresses: many(address),
}));

export const mcShowReviewRelation = relations(mcShowReview, ({ one }) => ({
  reviewer: one(user, {
    fields: [mcShowReview.reviewer_id],
    references: [user.id],
  }),
  showPlatformMc: one(showPlatformMc, {
    fields: [
      mcShowReview.show_id,
      mcShowReview.platform_id,
      mcShowReview.mc_id,
    ],
    references: [
      showPlatformMc.show_id,
      showPlatformMc.platform_id,
      showPlatformMc.mc_id,
    ],
  }),
}));

export const mcRelation = relations(mc, ({ one, many }) => ({
  user: one(user, {
    fields: [mc.user_id],
    references: [user.id],
  }),
  showPlatformMcs: many(showPlatformMc),
}));

export const operatorRelation = relations(operator, ({ one, many }) => ({
  user: one(user, {
    fields: [operator.user_id],
    references: [user.id],
  }),
  tasks: many(task),
}));

export const platformRelation = relations(platform, ({ many }) => ({
  showPlatforms: many(showPlatform),
}));

export const showPlatformMaterialRelation = relations(
  showPlatformMaterial,
  ({ one }) => ({
    material: one(brandMaterial, {
      fields: [showPlatformMaterial.brand_material_id],
      references: [brandMaterial.id],
    }),
    showPlatform: one(showPlatform, {
      fields: [showPlatformMaterial.show_id, showPlatformMaterial.platform_id],
      references: [showPlatform.show_id, showPlatform.platform_id],
    }),
  })
);

export const showPlatformMcRelation = relations(
  showPlatformMc,
  ({ one, many }) => ({
    mc: one(mc, {
      fields: [showPlatformMc.mc_id],
      references: [mc.id],
    }),
    reviews: many(mcShowReview),
    showPlatform: one(showPlatform, {
      fields: [showPlatformMc.show_id, showPlatformMc.platform_id],
      references: [showPlatform.show_id, showPlatform.platform_id],
    }),
  })
);

export const showPlatformRelation = relations(
  showPlatform,
  ({ one, many }) => ({
    materials: many(showPlatformMaterial),
    mcs: many(showPlatformMc),
    platform: one(platform, {
      fields: [showPlatform.platform_id],
      references: [platform.id],
    }),
    reviews: many(showPlatformReview),
    show: one(show, {
      fields: [showPlatform.show_id],
      references: [show.id],
    }),
    studioRoom: one(studioRoom, {
      fields: [showPlatform.studio_room_id],
      references: [studioRoom.id],
    }),
    tasks: many(task),
  })
);

export const showPlatformReviewRelation = relations(
  showPlatformReview,
  ({ one }) => ({
    reviewer: one(user, {
      fields: [showPlatformReview.reviewer_id],
      references: [user.id],
    }),
    showPlatform: one(showPlatform, {
      fields: [showPlatformReview.show_id, showPlatformReview.platform_id],
      references: [showPlatform.show_id, showPlatform.platform_id],
    }),
  })
);

export const showRelation = relations(show, ({ one, many }) => ({
  brand: one(brand, {
    fields: [show.brand_id],
    references: [brand.id],
  }),
  showPlatforms: many(showPlatform),
}));

export const studioRoomRelation = relations(studioRoom, ({ one, many }) => ({
  showPlatforms: many(showPlatform),
  studio: one(studio, {
    fields: [studioRoom.studio_id],
    references: [studio.id],
  }),
}));

export const studioRelation = relations(studio, ({ one, many }) => ({
  address: one(address, {
    fields: [studio.address_id],
    references: [address.id],
  }),
  rooms: many(studioRoom),
}));

export const taskRelation = relations(task, ({ one }) => ({
  operator: one(operator, {
    fields: [task.operator_id],
    references: [operator.id],
  }),
  showPlatform: one(showPlatform, {
    fields: [task.show_id, task.platform_id],
    references: [showPlatform.show_id, showPlatform.platform_id],
  }),
}));

export const userRelation = relations(user, ({ one, many }) => ({
  mcShowReviews: many(mcShowReview),
  mc: one(mc, {
    fields: [user.id],
    references: [mc.user_id],
  }),
  operator: one(operator, {
    fields: [user.id],
    references: [operator.user_id],
  }),
  showPlatformReviews: many(showPlatformReview),
}));
