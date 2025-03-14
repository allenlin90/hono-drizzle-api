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
    fields: [address.cityId],
    references: [city.id],
  }),
}));

export const brandRelation = relations(brand, ({ many }) => ({
  materials: many(brandMaterial),
  shows: many(show),
}));

export const cityRelation = relations(city, ({ many }) => ({
  addresses: many(address),
}));

export const mcShowReviewRelation = relations(mcShowReview, ({ one }) => ({
  mc: one(mc, {
    fields: [mcShowReview.mcId],
    references: [mc.id],
  }),
  reviewer: one(user, {
    fields: [mcShowReview.reviewerId],
    references: [user.id],
  }),
  showPlatformMc: one(showPlatformMc, {
    fields: [mcShowReview.showPlatformMcId],
    references: [showPlatformMc.id],
  }),
}));

export const mcRelation = relations(mc, ({ one, many }) => ({
  showPlatformMcs: many(showPlatformMc),
  user: one(user, {
    fields: [mc.userId],
    references: [user.id],
  }),
  showReviews: many(mcShowReview),
}));

export const operatorRelation = relations(operator, ({ one, many }) => ({
  user: one(user, {
    fields: [operator.userId],
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
    showPlatform: one(showPlatform, {
      fields: [showPlatformMaterial.showPlatformId],
      references: [showPlatform.id],
    }),
    material: one(brandMaterial, {
      fields: [showPlatformMaterial.brandMaterialId],
      references: [brandMaterial.id],
    }),
  })
);

export const brandMaterialRelation = relations(
  brandMaterial,
  ({ one, many }) => ({
    brand: one(brand, {
      fields: [brandMaterial.brandId],
      references: [brand.id],
    }),
    showPlatformMaterials: many(showPlatformMaterial),
  })
);

export const showPlatformMcRelation = relations(
  showPlatformMc,
  ({ one, many }) => ({
    showPlatform: one(showPlatform, {
      fields: [showPlatformMc.showPlatformId],
      references: [showPlatform.id],
    }),
    mc: one(mc, {
      fields: [showPlatformMc.mcId],
      references: [mc.id],
    }),
    mcShowReviews: many(mcShowReview),
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
    tasks: many(task),
    showPlatformReviews: many(showPlatformReview),
  })
);

export const showPlatformReviewRelation = relations(
  showPlatformReview,
  ({ one }) => ({
    showPlatform: one(showPlatform, {
      fields: [showPlatformReview.showPlatformId],
      references: [showPlatform.id],
    }),
    reviewer: one(user, {
      fields: [showPlatformReview.reviewerId],
      references: [user.id],
    }),
  })
);

export const showRelation = relations(show, ({ one, many }) => ({
  brand: one(brand, {
    fields: [show.brandId],
    references: [brand.id],
  }),
  showPlatforms: many(showPlatform),
}));

export const studioRoomRelation = relations(studioRoom, ({ one, many }) => ({
  studio: one(studio, {
    fields: [studioRoom.studioId],
    references: [studio.id],
  }),
  showPlatforms: many(showPlatform),
}));

export const studioRelation = relations(studio, ({ one, many }) => ({
  rooms: many(studioRoom),
  address: one(address, {
    fields: [studio.addressId],
    references: [address.id],
  }),
}));

export const taskRelation = relations(task, ({ one }) => ({
  operator: one(operator, {
    fields: [task.operatorId],
    references: [operator.id],
  }),
  showPlatform: one(showPlatform, {
    fields: [task.showPlatformId],
    references: [showPlatform.id],
  }),
}));

export const userRelation = relations(user, ({ one, many }) => ({
  mcShowReviews: many(mcShowReview),
  mc: one(mc, {
    fields: [user.id],
    references: [mc.userId],
  }),
  operator: one(operator, {
    fields: [user.id],
    references: [operator.userId],
  }),
  showPlatformReviews: many(showPlatformReview),
}));
