import { getEnv } from './env/env.validation';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({ path: '.env.development' });

const env = getEnv();

export default new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
  synchronize: false
});
