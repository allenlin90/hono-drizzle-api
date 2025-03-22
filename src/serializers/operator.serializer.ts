import {
  selectOperatorSchema,
  type SelectOperatorSchema,
} from "@/db/schema/operator.schema";

export const operatorSerializer = (operator: SelectOperatorSchema) => {
  return selectOperatorSchema.parse(operator);
};
