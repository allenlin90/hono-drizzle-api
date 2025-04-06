import { show, selectShowSchema } from "@/db/schema/show.schema";

type ShowWithBrandId = typeof show.$inferSelect & { brand_uid: string };

export const showSerializer = (show: ShowWithBrandId) => {
  return selectShowSchema.parse(show);
};
