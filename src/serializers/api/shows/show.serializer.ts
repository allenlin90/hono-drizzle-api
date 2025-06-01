import { selectClientSchema } from "@/db/schema/client.schema";
import { selectStudioRoomSchema } from '@/db/schema/studio-room.schema';
import { selectShowSchema } from "@/db/schema/show.schema";
import { z } from "zod";

export const ShowSchema = selectShowSchema
  .omit({
    client_uid: true,
    studio_room_uid: true,
  })
  .extend({
    client: selectClientSchema.nullable(),
    studio_room: selectStudioRoomSchema.omit({ studio_uid: true }).nullable(),
  });

export const ShowTransformer = ShowSchema.transform((data) => ({
  id: data.uid,
  name: data.name,
  client: data.client ? {
    id: data.client.uid,
    name: data.client.name,
    created_at: data.client.created_at,
    updated_at: data.client.updated_at,
  } : null,
  studio_room: data.studio_room ? {
    id: data.studio_room.uid,
    name: data.studio_room.name,
    created_at: data.studio_room.created_at,
    updated_at: data.studio_room.updated_at,
  } : null,
  start_time: data.start_time,
  end_time: data.end_time,
  created_at: data.created_at,
  updated_at: data.updated_at,
}));

export const showSerializer = (show: z.infer<typeof ShowSchema>) => {
  const parsed = ShowTransformer.parse(show);

  return {
    object: "show",
    ...parsed,
  };
};
