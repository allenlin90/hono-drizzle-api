import {
  selectMaterialSchema,
  type SelectMaterialSchema,
} from "@/db/schema/material.schema";

export const MaterialSchema = selectMaterialSchema.transform((data) => ({
  id: data.uid,
  client_id: data.client_uid,
  name: data.name,
  type: data.type,
  is_active: data.is_active,
  description: data.description,
  resource_url: data.resource_url,
  created_at: data.created_at,
  updated_at: data.updated_at,
}));

export const materialSerializer = (material: SelectMaterialSchema) => {
  const parsed = MaterialSchema.parse(material);

  return {
    object: 'material',
    ...parsed,
  };
};
