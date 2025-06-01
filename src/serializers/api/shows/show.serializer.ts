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

export const ShowExpandedSchema = z.object({
  id: z.string(),
  name: z.string(),
  client: z
    .object({
      id: z.string(),
      name: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    })
    .nullable(),
  studio_room: z
    .object({
      id: z.string(),
      name: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    })
    .nullable(),
  start_time: z.string(),
  end_time: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const showSerializer = (show: z.infer<typeof ShowSchema>) => {
  return {
    object: "show",
    id: show.uid, // fallback if id is not present
    name: show.name,
    client: show.client
      ? {
        id: show.client.uid,
        name: show.client.name,
        created_at: show.client.created_at,
        updated_at: show.client.updated_at,
      }
      : null,
    studio_room: show.studio_room
      ? {
        id: show.studio_room.uid,
        name: show.studio_room.name,
        created_at: show.studio_room.created_at,
        updated_at: show.studio_room.updated_at,
      }
      : null,
    start_time: show.start_time,
    end_time: show.end_time,
    created_at: show.created_at,
    updated_at: show.updated_at,
  };
};
