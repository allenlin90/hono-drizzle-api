import type { JWTPayload } from 'jose';
import type { User } from 'better-auth';
import { z } from '@hono/zod-openapi';
import { memberSchema } from 'better-auth/plugins';

export type Member = z.infer<typeof memberSchema>;

export type AuthPayload = JWTPayload &
  User & {
    memberships?: Member[];
  };
