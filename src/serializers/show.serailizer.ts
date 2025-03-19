import { show, selectShowSchema } from "@/db/schema/show.schema";

// TODO: find a better way to extend associated data
type ShowWithBrand = typeof show.$inferSelect & {
  brand_id: string;
};

export const showSerializer = (show: ShowWithBrand) => {
  return selectShowSchema.parse(show);
};
