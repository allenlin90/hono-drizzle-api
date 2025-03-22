import { PageParams } from "../page-params";
import { NameParams } from "../name-params";
import { userIdSchema } from "../id-query-params";

export const McParamFilters = PageParams()
  .merge(userIdSchema)
  .merge(NameParams(["Sandy", "John"]));

export default McParamFilters;
