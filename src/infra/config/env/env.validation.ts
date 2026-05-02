import { z } from 'zod';

export const ENVSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().default('localhost'),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3001/v1/api')
    .transform((val) => val.split(',')),

  DATABASE_URL: z.string().default('postgresql://notification:notification123@db:5432/notification'),
  REDIS_URL: z.string().default('redis://cache:6379'),
  RABBITMQ_QUEUE_URL: z.string().default('amqp://notification:notification123@queue:5672'),
  RABBITMQ_QUEUE_NAME: z.string().default('RABBITMQ_NOTIFICATION_QUEUE'),

  JWT_TOKEN_SECRET: z.string().default('notification-system'),
  JWT_TOKEN_EXPIRESIN: z.coerce.number().int().positive().default(3600),
  JWT_REFRESH_TOKKEN_SECRET: z.string().default('notification-system'),
  REFRESH_TOKEN_EXPIRESIN: z.coerce.number().int().positive().default(86400),
  JWT_TOKEN_AUDIENCE: z.string().default('localhost:3001/v1/api'),
  JWT_TOKEN_ISSUER: z.string().default('localhost:3001/v1/api')
});

export type Env = z.infer<typeof ENVSchema>;

export const validate = (config: Record<string, unknown>): Env => {
  return ENVSchema.parse(config);
};

export const getEnv = (): Env => ENVSchema.parse(process.env);
