import { getEnv } from './env.validation';
import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => {
  const env = getEnv();
  return {
    environment: env.NODE_ENV || 'production',
    port: env.PORT || 3001
  };
});
