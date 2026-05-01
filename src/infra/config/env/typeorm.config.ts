import { isDevEnv } from '../app.enviroment';
import { getEnv } from './env.validation';
import { registerAs } from '@nestjs/config';

export default registerAs('typeorm', () => {
  const env = getEnv();

  return {
    type: 'postgres',
    url: env.DATABASE_URL,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*.{ts,js}'],
    migrationsRun: false,
    synchronize: false,
    logging: isDevEnv,
    ssl: false,
    extra: { max: 10 }
  };
});
