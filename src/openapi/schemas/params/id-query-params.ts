import { z } from "@hono/zod-openapi";
import { PREFIX } from "@/constants";

export const addressIdSchema = z.object({
  address_id: z.optional(z.string().startsWith(PREFIX.ADDRESS)).openapi({
    param: {
      name: "address_id",
      in: "query",
      required: false,
    },
    example: `${PREFIX.ADDRESS}_1234`,
  }),
});

export const clientIdSchema = z.object({
  client_id: z.optional(z.string().startsWith(PREFIX.CLIENT)).openapi({
    param: {
      name: "client_id",
      in: "query",
      required: false,
    },
    example: `${PREFIX.CLIENT}_1234`,
  }),
});

export const cityIdSchema = z.object({
  city_id: z.optional(z.string().startsWith(PREFIX.CITY)).openapi({
    param: {
      name: "city_id",
      in: "query",
      required: false,
    },
    example: `${PREFIX.CITY}_1234`,
  }),
});

export const materialIdSchema = z.object({
  material_id: z.optional(z.string().startsWith(PREFIX.MATERIAL)).openapi({
    param: {
      name: "material_id",
      in: "query",
      required: false,
    },
    example: `${PREFIX.MATERIAL}_1234`,
  }),
});

export const mcIdSchema = z.object({
  mc_id: z.optional(z.string().startsWith(PREFIX.MC)).openapi({
    param: {
      name: "mc_id",
      in: "query",
      required: false,
    },
    example: `${PREFIX.MC}_1234`,
  }),
});

export const platformIdSchema = z.object({
  platform_id: z.optional(z.string().startsWith(PREFIX.PLATFORM)).openapi({
    param: {
      name: "platform_id",
      in: "query",
      required: false,
    },
    example: `${PREFIX.PLATFORM}_1234`,
  }),
});

export const showPlatformIdSchema = z.object({
  show_platform_id: z
    .optional(z.string().startsWith(PREFIX.SHOW_PLATFORM))
    .openapi({
      param: {
        name: "show_platform_id",
        in: "query",
        required: false,
      },
      example: `${PREFIX.SHOW_PLATFORM}_1234`,
    }),
});

export const showIdSchema = z.object({
  show_id: z.optional(z.string().startsWith(PREFIX.SHOW)).openapi({
    param: {
      name: "show_id",
      in: "query",
      required: false,
    },
    example: `${PREFIX.SHOW}_1234`,
  }),
});

export const studioIdSchema = z.object({
  studio_id: z.optional(z.string().startsWith(PREFIX.STUDIO)).openapi({
    param: {
      name: "studio_id",
      in: "query",
      required: false,
    },
    example: `${PREFIX.STUDIO}_1234`,
  }),
});

export const studioRoomIdSchema = z.object({
  studio_room_id: z
    .optional(z.string().startsWith(PREFIX.STUDIO_ROOM))
    .openapi({
      param: {
        name: "studio_room_id",
        in: "query",
        required: false,
      },
      example: `${PREFIX.STUDIO_ROOM}_1234`,
    }),
});

export const taskIdSchema = z.object({
  task_id: z.optional(z.string().startsWith(PREFIX.TASK)).openapi({
    param: {
      name: "task_id",
      in: "query",
      required: false,
    },
    example: `${PREFIX.TASK}_1234`,
  }),
});
