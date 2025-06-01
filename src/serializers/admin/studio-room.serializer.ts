import {
  selectStudioRoomSchema,
  type SelectStudioRoomSchema,
} from "@/db/schema/studio-room.schema";

export const StudioRoomSchema = selectStudioRoomSchema.transform((data) => ({
  id: data.uid,
  name: data.name,
  studio_id: data.studio_uid,
  type: data.type,
  created_at: data.created_at,
  updated_at: data.updated_at,
}));

export const studioRoomSerializer = (studioRoom: SelectStudioRoomSchema) => {
  const parsed = StudioRoomSchema.parse(studioRoom);

  return {
    object: "studio_room",
    ...parsed,
  };
};
