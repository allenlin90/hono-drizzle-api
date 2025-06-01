import { addressIdSchema } from "../params/id-query-params";
import { NameParams } from "../params/name-params";
import { PageParams } from "../params/page-params";

export const StudioParamFilters = PageParams()
  .merge(NameParams(["onnut"]))
  .merge(addressIdSchema);

export default StudioParamFilters;
