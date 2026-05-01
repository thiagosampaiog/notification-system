import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { getEnv } from './env/env.validation';

dotenv.config({ path: '.env.development' });

const env = getEnv();

export default new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../infra/database/migrations/*.{ts,js}'],
  synchronize: false,
});