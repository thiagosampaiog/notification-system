import { getEnv } from './env.validation';
import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => {
  const env = getEnv();
  return {
    redisUrl: env.REDIS_URL
  };
});
