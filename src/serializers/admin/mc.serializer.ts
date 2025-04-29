import { selectMcSchema, type SelectMcSchema } from "@/db/schema/mc.schema";

export const mcSerializer = (mc: SelectMcSchema) => {
  return selectMcSchema.parse(mc);
};
