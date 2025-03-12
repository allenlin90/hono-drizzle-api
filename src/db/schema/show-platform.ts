import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { timestamps } from "../helpers/columns.helpers";
import { platform } from "./platform.schema";
import { show } from "./show.schema";
import { studioRoom } from "./studio-room.schema";

export const showPlatform = table(
  "show_platform",
  {
    id: t.serial("id").primaryKey(),
    showId: t
      .integer("show_id")
      .references(() => show.id)
      .notNull(),
    platformId: t
      .integer("platform_id")
      .references(() => platform.id)
      .notNull(),
    is_active: t.boolean("is_active").default(true).notNull(),
    studioRoomId: t.integer("studio_room_id").references(() => studioRoom.id),
    ...timestamps,
  },
  (table) => [t.unique().on(table.showId, table.platformId)]
);
