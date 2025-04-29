import type { bulkInsertShows } from "@/services/show/bulk-insert";

import { showSerializer } from "./show.serializer";

type ShowBulkSerializer = Omit<
  Awaited<ReturnType<typeof bulkInsertShows>>,
  "errors"
>;

export const showBulkSerializer = async ({
  resolvedIds,
  insertedShows,
}: ShowBulkSerializer) => {
  const brands = resolvedIds.brandMap.values();
  const brandMapById = new Map(brands.map((brand) => [brand.id, brand]));

  const shows = insertedShows.map((show) => ({
    ...show,
    brand_uid: brandMapById.get(show.brand_id)!.uid,
  }));

  return shows.map((show) => showSerializer(show));
};
