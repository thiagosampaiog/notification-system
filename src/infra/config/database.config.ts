import { registerAs } from '@nestjs/config';
import { getEnv } from './env.validation';

const env = getEnv();

export default registerAs('database', () => ({
  databaseUrl: env.DATABASE_URL,
}));
