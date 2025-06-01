import {
  selectClientSchema,
  type SelectClientSchema,
} from "@/db/schema/client.schema";

export const ClientSchema = selectClientSchema.transform((data) => ({
  id: data.uid,
  name: data.name,
  created_at: data.created_at,
  updated_at: data.updated_at,
}));

// Expose `uid` as `id` and hide surrogate key
export const clientSerializer = (client: SelectClientSchema & { uid: string; }) => {
  const parsed = ClientSchema.parse(client);

  return {
    object: 'client',
    ...parsed,
  };
};

export default clientSerializer;
