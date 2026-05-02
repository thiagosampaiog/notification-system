import { getEnv } from './env.validation';
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  const env = getEnv();
  return {
    environment: env.NODE_ENV || 'production',
    port: env.PORT || 3001,
    host: env.HOST || 'localhost',
    name: env.NAME || 'notification_system',
    cors: env.CORS_ALLOWED_ORIGINS
  };
});
