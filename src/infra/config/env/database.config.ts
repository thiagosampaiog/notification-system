import { getEnv } from './env.validation';
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const env = getEnv();
  return {
    databaseUrl: env.DATABASE_URL
  };
});
