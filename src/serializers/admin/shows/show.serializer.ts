import {
  selectShowSchema,
  type SelectShowSchema
} from "@/db/schema/show.schema";

export const ShowSchema = selectShowSchema.transform((data) => ({
  id: data.uid,
  name: data.name,
  client_id: data.client_uid,
  studio_room_id: data.studio_room_uid,
  start_time: data.start_time,
  end_time: data.end_time,
  created_at: data.created_at,
  updated_at: data.updated_at,
}));

export const showSerializer = (show: SelectShowSchema) => {
  const parsed = ShowSchema.parse(show);

  return {
    object: "show",
    ...parsed,
  };
};
