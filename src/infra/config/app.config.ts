import { registerAs } from '@nestjs/config';
import { getEnv } from './env.validation';

const env = getEnv()

export default registerAs('appConfig', () => ({
  environment: env.NODE_ENV || 'production',
  port: env.PORT || 3001,
}));
