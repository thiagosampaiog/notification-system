import { getEnv } from './env.validation';
import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => {
  const env = getEnv();
  return {
    url: env.RABBITMQ_QUEUE_URL,
    main_name: env.RABBITMQ_QUEUE_MAIN_NAME,
    recovery_name: env.RABBITMQ_QUEUE_RECOVERY_NAME
  };
});
