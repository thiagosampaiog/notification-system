import { z } from 'zod';

export const ENVSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  RABBITMQ_URL: z.string(),
  JWT_TOKEN_SECRET: z.string(),
  JWT_TOKEN_EXPIRESIN: z.coerce.number().int().positive(),
  REFRESH_TOKEN_EXPIRESIN: z.coerce.number().int().positive(),
  JWT_TOKEN_AUDIENCE: z.string(),
  JWT_TOKEN_ISSUER: z.string()
});

export type Env = z.infer<typeof ENVSchema>;

export const validate = (config: Record<string, unknown>): Env => {
  return ENVSchema.parse(config);
};

export const getEnv = (): Env => ENVSchema.parse(process.env);
