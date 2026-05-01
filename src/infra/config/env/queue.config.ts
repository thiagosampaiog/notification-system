import { getEnv } from './env.validation';
import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => {
  const env = getEnv();
  return {
    queueUrl: env.RABBITMQ_URL
  };
});