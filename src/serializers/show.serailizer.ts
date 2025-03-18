import type { brand } from "@/db/schema";
import { show, selectShowSchema } from "@/db/schema/show.schema";

type ShowWithBrand = typeof show.$inferSelect & {
  brand: Partial<typeof brand.$inferSelect>;
};

export const showSerializer = (show: ShowWithBrand) => {
  const extendedShow = { brand_uid: show.brand.uid, ...show };

  return selectShowSchema.parse(extendedShow);
};
