import { PageParams } from "../params/page-params";
import { NameParams } from "../params/name-params";
import { mcIdSchema } from "../params/id-query-params";
import { z } from "@hono/zod-openapi";
import { rankingTypeEnum } from "@/db/schema";
import { PREFIX } from "@/constants";

export const McParamFilters = PageParams()
  .merge(mcIdSchema)
  .merge(NameParams(["Sandy", "John"]))
  .merge(z.object({
    id: z.string().startsWith(PREFIX.MC).optional(),
    banned: z.boolean().optional(),
    email: z.string().email().optional(),
    ext_id: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
    ranking: z.enum(rankingTypeEnum.enumValues).optional(),
  }));

export default McParamFilters;
