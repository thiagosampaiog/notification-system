import { getEnv } from './env.validation';
import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => {
  const env = getEnv();
  return {
    url: env.RABBITMQ_QUEUE_URL,
    name: env.RABBITMQ_QUEUE_NAME
  };
});
