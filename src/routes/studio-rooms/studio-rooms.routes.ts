import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/http-status-codes";
import {
  insertStudioRoomSchema,
  patchStudioRoomSchema,
  selectStudioRoomSchema,
} from "@/db/schema/studio-room.schema";
import { PREFIX } from "@/constants";
import jsonContent from "@/openapi/helpers/json-content";
import jsonContentRequired from "@/openapi/helpers/json-content-required";
import jsonContentOneOf from "@/openapi/helpers/json-content-one-of";
import { createErrorSchema } from "@/openapi/schemas/create-error-schema";
import { IdParams } from "@/openapi/schemas/id-params";
import { UnauthorizedSchema } from "@/openapi/schemas/unauthorized";
import notFoundSchema from "@/openapi/schemas/not-found";
import createMessageObjectSchema from "@/openapi/schemas/create-message-object";
import { PaginatedObjectsSchema } from "@/openapi/schemas/paginated-objects";
import StudioRoomParamFilters from "@/openapi/schemas/studio-rooms/studio-room-param-filters";

const tags = ["StudioRooms"];

export const list = createRoute({
  tags,
  path: "/studio-rooms",
  method: "get",
  request: {
    query: StudioRoomParamFilters,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PaginatedObjectsSchema({
        objectType: "studio",
        objectSchema: selectStudioRoomSchema,
      }),
      "List of studio rooms"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      UnauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(StudioRoomParamFilters), notFoundSchema],
      "Provided query params are not processable"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/studio-rooms",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertStudioRoomSchema,
      "The studio room to create"
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectStudioRoomSchema,
      "The created studio room"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertStudioRoomSchema),
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Studio not found"),
      "Studio not found"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/studio-rooms/{id}",
  method: "get",
  request: {
    params: IdParams(PREFIX.STUDIO_ROOM),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectStudioRoomSchema,
      "The requested studio room"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.STUDIO_ROOM)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Studio room not found"
    ),
  },
});

export const patch = createRoute({
  tags,
  path: "/studio-rooms/{id}",
  method: "patch",
  request: {
    params: IdParams(PREFIX.STUDIO_ROOM),
    body: jsonContentRequired(
      patchStudioRoomSchema,
      "The studio room to update"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectStudioRoomSchema,
      "The updated studio room object"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [
        createErrorSchema(patchStudioRoomSchema),
        createErrorSchema(IdParams(PREFIX.STUDIO_ROOM)),
      ],
      "The validation error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Studio room not found"
    ),
  },
});

export const remove = createRoute({
  tags,
  path: "/studio-rooms/{id}",
  method: "delete",
  request: {
    params: IdParams(PREFIX.STUDIO_ROOM),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "The studio room was deleted",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParams(PREFIX.STUDIO_ROOM)),
      "invalid id error"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Studio not found"
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
