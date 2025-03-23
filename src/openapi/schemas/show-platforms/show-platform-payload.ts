import { z } from "@hono/zod-openapi";
import { union } from "drizzle-orm/pg-core";
import { and, eq, isNull, sql } from "drizzle-orm";

import { PREFIX } from "@/constants";
import db from "@/db";
import { platform, show, studioRoom } from "@/db/schema";
import { insertShowPlatformSchema } from "@/db/schema/show-platform.schema";

type EntityTypes = "show" | "platform" | "studio_room";

const idValidators = {
  platform: {
    param: "platform_uid" as const,
    table: platform,
    prefix: PREFIX.PLATFORM,
  },
  show: {
    param: "show_uid" as const,
    table: show,
    prefix: PREFIX.SHOW,
  },
  studio_room: {
    param: "studio_room_uid" as const,
    table: studioRoom,
    prefix: PREFIX.STUDIO_ROOM,
  },
};

export const ShowPlatformPayloadSchema =
  insertShowPlatformSchema.transform<ShowPlatformPayload>(
    async (
      { is_active = false, ...value },
      ctx
    ): Promise<ShowPlatformPayload> => {
      const keys = Object.keys(value).map(
        (key) => key.split("_").slice(0, -1).join("_") as EntityTypes
      );

      const queries = keys.map((type) => {
        const { table, param } = idValidators[type];
        return db
          .select({
            object: sql<EntityTypes>`${type}`,
            id: table.id,
            uid: table.uid,
          })
          .from(table)
          .where(and(eq(table.uid, value[param]), isNull(table.deleted_at)));
      });

      // @ts-ignore
      const queryResult = await union(...queries);

      if (queryResult.length !== keys.length) {
        const objectTypes = queryResult.map(({ object }) => object);
        const entityNotFound = keys.filter((key) => !objectTypes.includes(key));

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${entityNotFound.join(", ")} not found`,
        });

        return z.NEVER;
      }

      const store = queryResult.reduce((store, result) => {
        store[result.object] = result;
        return store;
      }, {} as Omit<ShowPlatformPayload, "is_active">);

      return { ...store, is_active };
    }
  );

export interface ShowPlatformPayload {
  platform: { id: number; uid: string };
  show: { id: number; uid: string };
  studio_room: { id: number; uid: string };
  is_active: boolean | undefined;
}
