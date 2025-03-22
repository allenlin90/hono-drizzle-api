import { NameParams } from "../name-params";
import { PageParams } from "../page-params";
import { EmailParams } from "../email-params";

export const UserParamFilters = PageParams()
  .merge(NameParams(["username"]))
  .merge(EmailParams);

export default UserParamFilters;
