import {
  selectStudioRoomSchema,
  type SelectStudioRoomSchema,
} from "@/db/schema/studio-room.schema";

export const studioRoomSerializer = (studioRoom: SelectStudioRoomSchema) => {
  return selectStudioRoomSchema.parse(studioRoom);
};
