import { PageParams } from "../page-params";
import { NameParams } from "../name-params";
import { operatorIdSchema, userIdSchema } from "../id-query-params";

export const OperatorParamFilters = PageParams()
  .merge(userIdSchema)
  .merge(operatorIdSchema)
  .merge(NameParams(["Sandy", "John"]));

export default OperatorParamFilters;
