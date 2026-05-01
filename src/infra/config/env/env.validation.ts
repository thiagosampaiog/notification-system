import { z } from 'zod';

export const ENVSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3001').transform((val) => val.split(',')),

  DATABASE_URL: z.string().default('postgresql://notification:notification123@db:5432/notification'),
  REDIS_URL: z.string().default('redis://cache:6379'),
  RABBITMQ_URL: z.string().default('amqp://notification:notification123@queue:5672'),
  
  JWT_TOKEN_SECRET: z.string().default('notification-system'),
  JWT_TOKEN_EXPIRESIN: z.coerce.number().int().positive().default(3600),
  REFRESH_TOKEN_EXPIRESIN: z.coerce.number().int().positive().default(86400),
  JWT_TOKEN_AUDIENCE: z.string().default('localhost:3001'),
  JWT_TOKEN_ISSUER: z.string().default('localhost:3001')
});

export type Env = z.infer<typeof ENVSchema>;

export const validate = (config: Record<string, unknown>): Env => {
  return ENVSchema.parse(config);
};

export const getEnv = (): Env => ENVSchema.parse(process.env);
