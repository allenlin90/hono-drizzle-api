import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/columns.helpers";
import { platform } from "./platform.schema";
import { show } from "./show.schema";
import { studioRoom } from "./studio-room.schema";

export const showPlatform = table(
  "show_platform",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    show_id: t
      .integer("show_id")
      .references(() => show.id)
      .notNull(),
    platform_id: t
      .integer("platform_id")
      .references(() => platform.id)
      .notNull(),
    isActive: t.boolean("is_active").default(false).notNull(), // for show approval
    studioRoomId: t.integer("studio_room_id").references(() => studioRoom.id),
    ...timestamps,
  },
  (table) => [t.unique().on(table.show_id, table.platform_id)]
);
