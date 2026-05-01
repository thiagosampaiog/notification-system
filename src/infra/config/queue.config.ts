import { registerAs } from '@nestjs/config';
import { getEnv } from './env.validation';

const env = getEnv();
export default registerAs('queue', () => ({
  queueUrl: env.RABBITMQ_URL,
}));
