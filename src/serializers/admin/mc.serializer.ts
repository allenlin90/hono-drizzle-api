import { selectMcSchema, type SelectMcSchema } from "@/db/schema/mc.schema";

export const McSchema = selectMcSchema.transform((data) => ({
  id: data.uid,
  banned: data.banned,
  email: data.email,
  ext_id: data.ext_id,
  metadata: data.metadata,
  name: data.name,
  ranking: data.ranking,
  created_at: data.created_at,
  updated_at: data.updated_at,
}));

export const mcSerializer = (mc: SelectMcSchema) => {
  const parsed = McSchema.parse(mc);

  return {
    object: 'mc',
    ...parsed,
  };
};
