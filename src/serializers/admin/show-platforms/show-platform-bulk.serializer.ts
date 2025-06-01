import type { bulkInsertShowPlatform } from "@/services/show-platform/bulk-insert";

import { ShowPlatformSchema } from "@/serializers/admin/show-platforms/show-platform.serializer";

type ShowPlatformBulkSerializer = Omit<
  Awaited<ReturnType<typeof bulkInsertShowPlatform>>,
  "errors"
>;

export const showPlatformBulkSerializer = async ({
  resolvedIds,
  insertedShowPlatforms,
}: ShowPlatformBulkSerializer) => {
  const platforms = resolvedIds.platformMap.values();
  const platformMapById = new Map(
    platforms.map((platform) => [platform.id, platform])
  );
  const shows = resolvedIds.showMap.values();
  const showMapById = new Map(shows.map((show) => [show.id, show]));
  const reviewers = resolvedIds.reviewerMap.values();
  const reviewerMapById = new Map(reviewers.map((reviewer) => [reviewer.id, reviewer]));
  const reviewForms = resolvedIds.reviewFormMap.values();
  const reviewFormMapById = new Map(reviewForms.map((form) => [form.id, form]));

  const showPlatforms = insertedShowPlatforms.map((showPlatform) => ({
    ...showPlatform,
    platform_uid: platformMapById.get(showPlatform.platform_id)!.uid,
    show_uid: showMapById.get(showPlatform.show_id)!.uid,
    reviewer_uid: reviewerMapById.get(showPlatform.reviewer_id ?? 0)?.uid ?? null,
    review_form_uid: reviewFormMapById.get(showPlatform.review_form_id ?? 0)?.uid ?? null,
  }));

  return showPlatforms.map((sp) => ShowPlatformSchema.parse(sp));
};
