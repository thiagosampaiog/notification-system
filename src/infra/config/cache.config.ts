import { registerAs } from '@nestjs/config';
import { getEnv } from './env.validation';

const env = getEnv();
export default registerAs('cache', () => ({
  redisUrl: env.REDIS_URL,
}));
