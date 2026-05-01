import { getEnv } from './env/env.validation';
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const env = getEnv();
  const isDev = env.NODE_ENV === 'development';

  return {
    type: 'postgres' as const,
    url: env.DATABASE_URL,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*.{ts,js}'],
    migrationsRun: false,
    synchronize: false,
    logging: isDev,
    ssl: false,
    extra: { max: 10 }
  };
});
