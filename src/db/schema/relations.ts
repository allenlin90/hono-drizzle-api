import { relations } from "drizzle-orm";

import { address } from "./address.schema";
import { city } from "./city.schema";
import { client } from "./client.schema";
import { formTemplate } from "./form-template.schema";
import { material } from "./material.schema";
import { mc } from "./mc.schema";
import { member } from "./member.schema";
import { platform } from "./platform.schema";
import { showMcMaterial } from "./show-mc-material.schema";
import { showMc } from "./show-mc.schema";
import { showPlatform } from "./show-platform.schema";
import { show } from "./show.schema";
import { studioRoom } from "./studio-room.schema";
import { studio } from "./studio.schema";
import { onsetTask } from "./onset-task.schema";

export const addressRelation = relations(address, ({ one }) => ({
  city: one(city, {
    fields: [address.city_id],
    references: [city.id],
  }),
}));

export const cityRelation = relations(city, ({ many }) => ({
  addresses: many(address),
}));

export const clientRelation = relations(client, ({ many }) => ({
  materials: many(material),
  shows: many(show),
}));

export const formTemplateRelation = relations(formTemplate, ({ many }) => ({
  onsetTasks: many(onsetTask),
  showMcsReviews: many(showMc),
  showPlatformsReviews: many(showPlatform),
}));

export const materialRelation = relations(material, ({ one, many }) => ({
  client: one(client, {
    fields: [material.client_id],
    references: [client.id],
  }),
  showMcs: many(showMcMaterial),
}));

export const mcRelation = relations(mc, ({ one, many }) => ({
  shows: many(showMc),
}));

export const memberRelation = relations(member, ({ many }) => ({
  formTemplates: many(formTemplate),
  shows: many(showMc),
  onsetTasks: many(onsetTask),
}));

export const onsetTaskRelation = relations(onsetTask, (({ one, many }) => ({
  assignee: one(member, {
    fields: [onsetTask.assignee_id],
    references: [member.id],
  }),
  show: one(show, {
    fields: [onsetTask.show_id],
    references: [show.id],
  }),
})));

export const platformRelation = relations(platform, ({ many }) => ({
  shows: many(showPlatform),
}));

export const showMcMaterialRelation = relations(showMcMaterial, ({ one }) => ({
  showMc: one(showMc, {
    fields: [showMcMaterial.show_mc_id],
    references: [showMc.id],
  }),
  material: one(material, {
    fields: [showMcMaterial.material_id],
    references: [material.id],
  }),
}));

export const showMcRelation = relations(showMc, ({ one, many }) => ({
  show: one(show, {
    fields: [showMc.show_id],
    references: [show.id],
  }),
  materials: many(showMcMaterial),
  mc: one(mc, {
    fields: [showMc.mc_id],
    references: [mc.id],
  }),
  reviewFormTemplate: one(formTemplate, {
    fields: [showMc.review_form_id],
    references: [formTemplate.id],
  }),
  reviewer: one(member, {
    fields: [showMc.reviewer_id],
    references: [member.id],
  }),
}));

export const showPlatformRelation = relations(showPlatform, ({ one, }) => ({
  show: one(show, {
    fields: [showPlatform.show_id],
    references: [show.id],
  }),
  platform: one(platform, {
    fields: [showPlatform.platform_id],
    references: [platform.id],
  }),
  reviewFormTemplate: one(formTemplate, {
    fields: [showPlatform.review_form_id],
    references: [formTemplate.id],
  }),
  reviewer: one(member, {
    fields: [showPlatform.reviewer_id],
    references: [member.id],
  }),
}));

export const showRelation = relations(show, ({ one, many }) => ({
  client: one(client, {
    fields: [show.client_id],
    references: [client.id],
  }),
  mcs: many(showMc),
  onsetTasks: many(onsetTask),
  platforms: many(showPlatform),
  studioRoom: one(studioRoom, {
    fields: [show.studio_room_id],
    references: [studioRoom.id],
  }),
}));

export const studioRoomRelation = relations(studioRoom, ({ one, many }) => ({
  show: many(show),
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
