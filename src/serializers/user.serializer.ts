import {
  selectUserSchema,
  type SelectUserSchema,
} from "@/db/schema/user.schema";

export const userSerializer = (user: SelectUserSchema) => {
  return selectUserSchema.parse(user);
};
