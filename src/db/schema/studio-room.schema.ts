import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { PREFIX } from "@/constants";
import { brandedUid, timestamps } from "../helpers/columns.helpers";
import { studio } from "./studio.schema";

export const roomTypeEnum = t.pgEnum("studio_room_type", ["s", "m", "l"]);

export const studioRoom = table(
  "studio_room",
  {
    id: t.serial("id").primaryKey(),
    uid: brandedUid(PREFIX.STUDIO_ROOM),
    name: t.varchar("name", { length: 255 }).notNull(),
    studioId: t
      .integer("studio_id")
      .references(() => studio.id, { onDelete: "cascade" })
      .notNull(),
    type: roomTypeEnum().default("s").notNull(),
    ...timestamps,
  },
  (table) => [t.index("studio_room_name_idx").on(table.name)]
);
