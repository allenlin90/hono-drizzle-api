import type { bulkInsertShowPlatformMc } from "@/services/show-platform-mc/bulk-insert";

import { selectShowPlatformMcSchema } from "@/db/schema/show-platform-mc.schema";

type ShowPlatformMcBulkSerializer = Omit<
  Awaited<ReturnType<typeof bulkInsertShowPlatformMc>>,
  "errors"
>;

export const showPlatformMcBulkSerializer = async ({
  resolvedIds,
  insertedShowPlatformMcs,
}: ShowPlatformMcBulkSerializer) => {
  const mcs = resolvedIds.mcMap.values();
  const mcMapById = new Map(mcs.map((mc) => [mc.id, mc]));

  const platforms = resolvedIds.platformMap.values();
  const platformMapById = new Map(
    platforms.map((platform) => [platform.id, platform])
  );

  const shows = resolvedIds.showMap.values();
  const showMapById = new Map(shows.map((show) => [show.id, show]));

  const showPlatformMcs = insertedShowPlatformMcs.map((showPlatformMc) => ({
    ...showPlatformMc,
    mc_uid: mcMapById.get(showPlatformMc.mc_id)!.uid,
    platform_uid: platformMapById.get(showPlatformMc.platform_id)!.uid,
    show_uid: showMapById.get(showPlatformMc.show_id)!.uid,
  }));

  return showPlatformMcs.map((sp) => selectShowPlatformMcSchema.parse(sp));
};
