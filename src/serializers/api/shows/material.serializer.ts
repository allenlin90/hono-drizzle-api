import { selectClientSchema } from "@/db/schema/client.schema";
import { selectMaterialSchema } from "@/db/schema/material.schema";
import { z } from "zod";

export const MaterialSchema = selectMaterialSchema
  .extend({
    client: selectClientSchema.nullable(),
  })
  .omit({
    client_uid: true,
  });

export const ShowMaterialExpandedSchema = z.object({
  id: z.string(),
  client: z.object({
    id: z.string(),
    name: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }).nullable(),
  type: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  resource_url: z.string().url().nullable(),
});

export const showMaterialSerializer = (material: z.infer<typeof MaterialSchema>) => {
  return {
    id: material.uid,
    client: material.client
      ? {
        id: material.client.uid,
        name: material.client.name,
        created_at: material.client.created_at,
        updated_at: material.client.updated_at,
      }
      : null,
    type: material.type,
    name: material.name,
    description: material.description ?? null,
    resource_url: material.resource_url ?? null,
  };
};
