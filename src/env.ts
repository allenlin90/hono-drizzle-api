import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import path from 'node:path';
import { z } from 'zod';

const stringBoolean = z.coerce
  .string()
  .transform((val) => val === 'true')
  .default('false');

expand(
  config({
    path: path.resolve(
      process.cwd(),
      process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
    ),
  })
);

const EnvSchema = z.object({
  ADMIN_TOKEN: z
    .string()
    .transform((tokenCsv) => tokenCsv?.trim()?.split(','))
    .pipe(z.string().array())
    .optional(),
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(3000),
  JWK_HOST: z.string().url(),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('debug'),
  DATABASE_URL: z.string().url(),
  DB_MIGRATING: stringBoolean,
  DB_SEEDING: stringBoolean,
  OPEN_API_DOC_TITLE: z.string().default('livestream studio'),
});

export type env = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error('❌ Invalid env:');
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
