import { NameParams } from "../name-params";
import { PageParams } from "../page-params";
import { EmailParams } from "../email-params";
import { userIdSchema } from "../id-query-params";

export const UserParamFilters = PageParams()
  .merge(NameParams(["username"]))
  .merge(userIdSchema)
  .merge(EmailParams);

export default UserParamFilters;
